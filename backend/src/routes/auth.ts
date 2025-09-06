import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Схемы валидации
const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Обновление токена
  fastify.post('/refresh', {
    schema: {
      tags: ['auth'],
      body: refreshTokenSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);

      // Проверяем refresh token
      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              isActive: true,
            },
          },
        },
      });

      if (!session) {
        return reply.status(401).send({
          success: false,
          message: 'Недействительный refresh token',
        });
      }

      if (!session.user.isActive) {
        return reply.status(401).send({
          success: false,
          message: 'Аккаунт деактивирован',
        });
      }

      // Генерируем новые токены
      const accessToken = fastify.jwt.sign(
        { userId: session.user.id, email: session.user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const newRefreshToken = fastify.jwt.sign(
        { userId: session.user.id, type: 'refresh' },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Обновляем сессию
      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: accessToken,
          refreshToken: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        },
      });

      return reply.send({
        success: true,
        message: 'Токены обновлены',
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении токена',
      });
    }
  });

  // Запрос на восстановление пароля
  fastify.post('/forgot-password', {
    schema: {
      tags: ['auth'],
      body: forgotPasswordSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email } = forgotPasswordSchema.parse(request.body);

      // Проверяем, существует ли пользователь
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Возвращаем успех даже если пользователь не найден (для безопасности)
        return reply.send({
          success: true,
          message: 'Если аккаунт с таким email существует, на него отправлена инструкция по восстановлению пароля',
        });
      }

      // Генерируем токен для сброса пароля
      const resetToken = fastify.jwt.sign(
        { userId: user.id, type: 'password-reset' },
        { expiresIn: '1h' }
      );

      // В реальном приложении здесь будет отправка email
      // Пока просто логируем токен
      fastify.log.info(`Reset token for ${email}: ${resetToken}`);

      return reply.send({
        success: true,
        message: 'Если аккаунт с таким email существует, на него отправлена инструкция по восстановлению пароля',
        // В реальном приложении не возвращаем токен
        // resetToken, // Только для разработки
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при запросе восстановления пароля',
      });
    }
  });

  // Сброс пароля
  fastify.post('/reset-password', {
    schema: {
      tags: ['auth'],
      body: resetPasswordSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { token, password } = resetPasswordSchema.parse(request.body);

      // Проверяем токен
      let decoded: any;
      try {
        decoded = fastify.jwt.verify(token);
      } catch (error) {
        return reply.status(400).send({
          success: false,
          message: 'Недействительный или истекший токен',
        });
      }

      if (decoded.type !== 'password-reset') {
        return reply.status(400).send({
          success: false,
          message: 'Недействительный токен',
        });
      }

      // Находим пользователя
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Пользователь не найден',
        });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(password, 12);

      // Обновляем пароль
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Деактивируем все сессии пользователя
      await prisma.session.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      });

      return reply.send({
        success: true,
        message: 'Пароль успешно изменен',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при сбросе пароля',
      });
    }
  });

  // Проверка токена
  fastify.get('/verify', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['auth'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          isActive: true,
          isPremium: true,
          isVerified: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Пользователь не найден',
        });
      }

      return reply.send({
        success: true,
        message: 'Токен действителен',
        user,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при проверке токена',
      });
    }
  });

  // Выход из всех устройств
  fastify.post('/logout-all', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['auth'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Деактивируем все сессии пользователя
      await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      return reply.send({
        success: true,
        message: 'Выход выполнен на всех устройствах',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при выходе',
      });
    }
  });
}