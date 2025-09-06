import { FastifyInstance } from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupWebSocket(fastify: FastifyInstance) {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware для аутентификации WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Токен не предоставлен'));
      }

      const session = await prisma.session.findFirst({
        where: {
          token,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              isActive: true,
            },
          },
        },
      });

      if (!session || !session.user.isActive) {
        return next(new Error('Недействительный токен'));
      }

      socket.userId = session.user.id;
      socket.username = session.user.username;
      next();
    } catch (error) {
      next(new Error('Ошибка аутентификации'));
    }
  });

  io.on('connection', (socket) => {
    fastify.log.info(`Пользователь ${socket.username} подключился к WebSocket`);

    // Присоединяем пользователя к его личной комнате
    socket.join(`user:${socket.userId}`);

    // Присоединяем к глобальной комнате
    socket.join('global');

    // Обработка обновления местоположения
    socket.on('location:update', async (data) => {
      try {
        const { lat, lng, isWalking } = data;
        
        // Обновляем местоположение в базе данных
        await prisma.user.update({
          where: { id: socket.userId },
          data: {
            location: JSON.stringify({ lat, lng }),
            lastActiveAt: new Date(),
          },
        });

        // Уведомляем других пользователей о новом местоположении
        socket.to('global').emit('user:location:update', {
          userId: socket.userId,
          username: socket.username,
          location: { lat, lng },
          isWalking,
          timestamp: new Date(),
        });

        // Если пользователь на прогулке, присоединяем к комнате активных пользователей
        if (isWalking) {
          socket.join('active:walking');
        } else {
          socket.leave('active:walking');
        }
      } catch (error) {
        fastify.log.error('Ошибка обновления местоположения:', error);
        socket.emit('error', { message: 'Ошибка обновления местоположения' });
      }
    });

    // Обработка сбора коллекционных предметов
    socket.on('collectible:collect', async (data) => {
      try {
        const { collectibleId } = data;
        
        // Проверяем, существует ли предмет
        const collectible = await prisma.collectibleSpawn.findUnique({
          where: { id: collectibleId },
          include: {
            collections: {
              where: { userId: socket.userId },
            },
          },
        });

        if (!collectible || !collectible.isActive) {
          socket.emit('error', { message: 'Предмет недоступен' });
          return;
        }

        if (collectible.collections.length > 0) {
          socket.emit('error', { message: 'Вы уже собрали этот предмет' });
          return;
        }

        // Создаем запись о сборе
        await prisma.collectibleCollection.create({
          data: {
            userId: socket.userId,
            spawnId: collectibleId,
            collectedAt: new Date(),
          },
        });

        // Начисляем валюту
        const currency = collectible.type === 'YARN_BALL' ? 'YARN' : 'BONES';
        await prisma.transaction.create({
          data: {
            userId: socket.userId,
            type: 'EARN',
            currency,
            amount: collectible.value,
            description: `Сбор ${collectible.type.toLowerCase()}`,
          },
        });

        // Уведомляем о успешном сборе
        socket.emit('collectible:collected', {
          collectibleId,
          reward: {
            currency,
            amount: collectible.value,
          },
        });

        // Уведомляем других пользователей
        socket.to('global').emit('collectible:collected:global', {
          collectibleId,
          userId: socket.userId,
          username: socket.username,
        });
      } catch (error) {
        fastify.log.error('Ошибка сбора предмета:', error);
        socket.emit('error', { message: 'Ошибка сбора предмета' });
      }
    });

    // Обработка сообщений в чате
    socket.on('chat:message', async (data) => {
      try {
        const { room, message, type = 'TEXT' } = data;
        
        // Сохраняем сообщение в базе данных
        const savedMessage = await prisma.message.create({
          data: {
            userId: socket.userId,
            roomId: room,
            content: message,
            type,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });

        // Отправляем сообщение в комнату
        io.to(room).emit('chat:message:new', savedMessage);
      } catch (error) {
        fastify.log.error('Ошибка отправки сообщения:', error);
        socket.emit('error', { message: 'Ошибка отправки сообщения' });
      }
    });

    // Присоединение к комнате чата
    socket.on('chat:join', (room) => {
      socket.join(room);
      fastify.log.info(`Пользователь ${socket.username} присоединился к комнате ${room}`);
    });

    // Покидание комнаты чата
    socket.on('chat:leave', (room) => {
      socket.leave(room);
      fastify.log.info(`Пользователь ${socket.username} покинул комнату ${room}`);
    });

    // Обработка уведомлений о новых совпадениях
    socket.on('match:request', async (data) => {
      try {
        const { targetUserId, message } = data;
        
        // Проверяем, существует ли пользователь
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
        });

        if (!targetUser) {
          socket.emit('error', { message: 'Пользователь не найден' });
          return;
        }

        // Создаем уведомление
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: 'MATCH',
            title: 'Новое совпадение',
            message: `${socket.username} хочет прогуляться с вами`,
            data: JSON.stringify({
              fromUserId: socket.userId,
              fromUsername: socket.username,
              message,
            }),
          },
        });

        // Отправляем уведомление пользователю
        io.to(`user:${targetUserId}`).emit('notification:new', {
          type: 'MATCH',
          title: 'Новое совпадение',
          message: `${socket.username} хочет прогуляться с вами`,
        });
      } catch (error) {
        fastify.log.error('Ошибка создания совпадения:', error);
        socket.emit('error', { message: 'Ошибка создания совпадения' });
      }
    });

    // Обработка отключения
    socket.on('disconnect', () => {
      fastify.log.info(`Пользователь ${socket.username} отключился от WebSocket`);
      
      // Уведомляем о том, что пользователь ушел
      socket.to('global').emit('user:offline', {
        userId: socket.userId,
        username: socket.username,
        timestamp: new Date(),
      });
    });
  });

  // Сохраняем экземпляр io в fastify для использования в роутах
  fastify.decorate('io', io);

  fastify.log.info('WebSocket сервер настроен');
}

