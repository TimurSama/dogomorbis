import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

const createRouteSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  waypoints: z.array(locationSchema).min(2),
  isPublic: z.boolean().default(true),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('EASY'),
  estimatedDuration: z.number().positive().optional(), // в минутах
  tags: z.array(z.string()).optional(),
});

const updateLocationSchema = z.object({
  location: locationSchema,
  isWalking: z.boolean().default(false),
});

const collectibleSchema = z.object({
  type: z.enum(['BONE', 'YARN_BALL', 'TOY', 'TREAT', 'SPECIAL']),
  location: locationSchema,
  value: z.number().positive().default(1),
});

export default async function mapRoutes(fastify: FastifyInstance) {
  // Обновление местоположения пользователя
  fastify.post('/location', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      body: updateLocationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = updateLocationSchema.parse(request.body);

      // Обновляем местоположение пользователя
      await prisma.user.update({
        where: { id: userId },
        data: {
          location: JSON.stringify(data.location),
          lastActiveAt: new Date(),
        },
      });

      // Если пользователь на прогулке, начисляем косточки
      if (data.isWalking) {
        await prisma.transaction.create({
          data: {
            userId,
            type: 'EARN',
            currency: 'BONES',
            amount: 5,
            description: 'Активность на карте',
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Местоположение обновлено',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении местоположения',
      });
    }
  });

  // Получение пользователей рядом
  fastify.get('/nearby', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 1000 }, // в метрах
          limit: { type: 'number', default: 50 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { lat, lng, radius = 1000, limit = 50 } = request.query as any;

      if (!lat || !lng) {
        return reply.status(400).send({
          success: false,
          message: 'Необходимо указать координаты',
        });
      }

      // Получаем всех активных пользователей
      const users = await prisma.user.findMany({
        where: {
          id: { not: userId },
          isActive: true,
          location: { not: null },
          lastActiveAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // активны в последние 30 минут
          },
        },
        include: {
          dogOwnerships: {
            where: { isActive: true },
            include: {
              dog: {
                include: {
                  photos: true,
                },
              },
            },
          },
          level: true,
        },
        take: limit,
      });

      // Фильтруем пользователей по расстоянию
      const nearbyUsers = users.filter(user => {
        if (!user.location) return false;
        
        const userLocation = JSON.parse(user.location);
        const distance = calculateDistance(lat, lng, userLocation.lat, userLocation.lng);
        
        return distance <= radius;
      }).map(user => ({
        ...user,
        location: user.location ? JSON.parse(user.location) : null,
        password: undefined,
      }));

      return reply.send({
        success: true,
        users: nearbyUsers,
        center: { lat, lng },
        radius,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении пользователей рядом',
      });
    }
  });

  // Создание маршрута
  fastify.post('/routes', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      body: createRouteSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createRouteSchema.parse(request.body);

      // Создаем маршрут (в реальном приложении это будет отдельная таблица)
      const route = {
        id: `route_${Date.now()}`,
        userId,
        name: data.name,
        description: data.description,
        waypoints: data.waypoints,
        isPublic: data.isPublic,
        difficulty: data.difficulty,
        estimatedDuration: data.estimatedDuration,
        tags: data.tags || [],
        createdAt: new Date(),
      };

      // Начисляем косточки за создание маршрута
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 15,
          description: 'Создание маршрута',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Маршрут создан',
        route,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании маршрута',
      });
    }
  });

  // Получение маршрутов
  fastify.get('/routes', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 5000 },
          difficulty: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lat, lng, radius = 5000, difficulty, limit = 20 } = request.query as any;

      // В реальном приложении здесь будет запрос к базе данных
      // Пока возвращаем примеры маршрутов
      const routes = [
        {
          id: 'route_1',
          name: 'Парк Горького',
          description: 'Красивый маршрут по парку',
          waypoints: [
            { lat: 55.7558, lng: 37.6176, address: 'Вход в парк' },
            { lat: 55.7568, lng: 37.6186, address: 'Фонтан' },
            { lat: 55.7578, lng: 37.6196, address: 'Выход из парка' },
          ],
          difficulty: 'EASY',
          estimatedDuration: 30,
          tags: ['парк', 'прогулка'],
          createdAt: new Date(),
        },
      ];

      return reply.send({
        success: true,
        routes,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении маршрутов',
      });
    }
  });

  // Создание коллекционного предмета
  fastify.post('/collectibles', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      body: collectibleSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = collectibleSchema.parse(request.body);

      const collectible = await prisma.collectibleSpawn.create({
        data: {
          type: data.type,
          location: JSON.stringify(data.location),
          value: data.value,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Коллекционный предмет создан',
        collectible: {
          ...collectible,
          location: JSON.parse(collectible.location),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании коллекционного предмета',
      });
    }
  });

  // Получение коллекционных предметов рядом
  fastify.get('/collectibles', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 500 },
          type: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lat, lng, radius = 500, type } = request.query as any;

      if (!lat || !lng) {
        return reply.status(400).send({
          success: false,
          message: 'Необходимо указать координаты',
        });
      }

      const where: any = {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      };

      if (type) {
        where.type = type;
      }

      const collectibles = await prisma.collectibleSpawn.findMany({
        where,
        include: {
          collections: {
            where: {
              userId: (request as any).user.userId,
            },
          },
        },
      });

      // Фильтруем по расстоянию
      const nearbyCollectibles = collectibles.filter(collectible => {
        const collectibleLocation = JSON.parse(collectible.location);
        const distance = calculateDistance(lat, lng, collectibleLocation.lat, collectibleLocation.lng);
        return distance <= radius;
      }).map(collectible => ({
        ...collectible,
        location: JSON.parse(collectible.location),
        isCollected: collectible.collections.length > 0,
      }));

      return reply.send({
        success: true,
        collectibles: nearbyCollectibles,
        center: { lat, lng },
        radius,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении коллекционных предметов',
      });
    }
  });

  // Сбор коллекционного предмета
  fastify.post('/collectibles/:id/collect', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };

      // Проверяем, существует ли предмет
      const collectible = await prisma.collectibleSpawn.findUnique({
        where: { id },
        include: {
          collections: {
            where: { userId },
          },
        },
      });

      if (!collectible) {
        return reply.status(404).send({
          success: false,
          message: 'Коллекционный предмет не найден',
        });
      }

      if (!collectible.isActive) {
        return reply.status(400).send({
          success: false,
          message: 'Предмет уже неактивен',
        });
      }

      if (collectible.collections.length > 0) {
        return reply.status(400).send({
          success: false,
          message: 'Вы уже собрали этот предмет',
        });
      }

      // Создаем запись о сборе
      await prisma.collectibleCollection.create({
        data: {
          userId,
          spawnId: id,
          collectedAt: new Date(),
        },
      });

      // Начисляем валюту
      const currency = collectible.type === 'YARN_BALL' ? 'YARN' : 'BONES';
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency,
          amount: collectible.value,
          description: `Сбор ${collectible.type.toLowerCase()}`,
        },
      });

      return reply.send({
        success: true,
        message: 'Предмет собран',
        reward: {
          currency,
          amount: collectible.value,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при сборе предмета',
      });
    }
  });

  // Получение событий на карте
  fastify.get('/events', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['map'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 5000 },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lat, lng, radius = 5000, limit = 20 } = request.query as any;

      if (!lat || !lng) {
        return reply.status(400).send({
          success: false,
          message: 'Необходимо указать координаты',
        });
      }

      const events = await prisma.event.findMany({
        where: {
          isPublic: true,
          startDate: { gte: new Date() },
        },
        include: {
          organizer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        take: limit,
        orderBy: { startDate: 'asc' },
      });

      // Фильтруем события по расстоянию
      const nearbyEvents = events.filter(event => {
        const eventLocation = JSON.parse(event.location);
        const distance = calculateDistance(lat, lng, eventLocation.lat, eventLocation.lng);
        return distance <= radius;
      }).map(event => ({
        ...event,
        location: JSON.parse(event.location),
      }));

      return reply.send({
        success: true,
        events: nearbyEvents,
        center: { lat, lng },
        radius,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении событий',
      });
    }
  });
}

// Вспомогательная функция для расчета расстояния между двумя точками
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в метрах
}

