import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Схемы валидации
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  language: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

const psychotypeTestSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
  })),
});

export default async function userRoutes(fastify: FastifyInstance) {
  // Регистрация
  fastify.post('/register', {
    schema: {
      tags: ['users'],
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
              },
            },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = registerSchema.parse(request.body);

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username },
          ],
        },
      });

      if (existingUser) {
        return reply.status(400).send({
          success: false,
          message: 'Пользователь с таким email или именем уже существует',
        });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          location: data.location ? JSON.stringify(data.location) : null,
        },
      });

      // Создаем уровень пользователя
      await prisma.level.create({
        data: {
          userId: user.id,
          level: 1,
          experience: 0,
          tier: 'BRONZE',
        },
      });

      // Генерируем токены
      const accessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        { userId: user.id, type: 'refresh' },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Сохраняем сессию
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при регистрации пользователя',
      });
    }
  });

  // Вход
  fastify.post('/login', {
    schema: {
      tags: ['users'],
      body: loginSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = loginSchema.parse(request.body);

      // Находим пользователя
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          level: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Неверный email или пароль',
        });
      }

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return reply.status(401).send({
          success: false,
          message: 'Неверный email или пароль',
        });
      }

      // Обновляем последний вход
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      });

      // Генерируем токены
      const accessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = fastify.jwt.sign(
        { userId: user.id, type: 'refresh' },
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Сохраняем сессию
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return reply.send({
        success: true,
        message: 'Успешный вход',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          bio: user.bio,
          isPremium: user.isPremium,
          level: user.level,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при входе',
      });
    }
  });

  // Получение профиля
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['users'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          level: true,
          dogOwnerships: {
            include: {
              dog: {
                include: {
                  photos: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              matchesAsUser1: true,
              matchesAsUser2: true,
            },
          },
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
        user: {
          ...user,
          password: undefined,
          location: user.location ? JSON.parse(user.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении профиля',
      });
    }
  });

  // Обновление профиля
  fastify.put('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['users'],
      security: [{ Bearer: [] }],
      body: updateProfileSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = updateProfileSchema.parse(request.body);

      const updateData: any = { ...data };
      if (data.location) {
        updateData.location = JSON.stringify(data.location);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return reply.send({
        success: true,
        message: 'Профиль обновлен',
        user: {
          ...user,
          password: undefined,
          location: user.location ? JSON.parse(user.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении профиля',
      });
    }
  });

  // Прохождение теста психотипа
  fastify.post('/psychotype-test', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['users'],
      security: [{ Bearer: [] }],
      body: psychotypeTestSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = psychotypeTestSchema.parse(request.body);

      // Простая логика определения психотипа
      // В реальном приложении здесь будет более сложный алгоритм
      const answers = data.answers;
      let extrovertScore = 0;
      let introvertScore = 0;

      answers.forEach(answer => {
        if (answer.answer === 'A' || answer.answer === 'B') {
          extrovertScore++;
        } else {
          introvertScore++;
        }
      });

      let psychotype = 'AMBIVERT';
      if (extrovertScore > introvertScore + 2) {
        psychotype = 'EXTROVERT';
      } else if (introvertScore > extrovertScore + 2) {
        psychotype = 'INTROVERT';
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          psychotype,
          psychotypeTestCompleted: true,
        },
      });

      // Начисляем косточки за прохождение теста
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 50,
          description: 'Прохождение теста психотипа',
        },
      });

      return reply.send({
        success: true,
        message: 'Тест психотипа пройден',
        psychotype,
        user: {
          ...user,
          password: undefined,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при прохождении теста',
      });
    }
  });

  // Поиск пользователей
  fastify.get('/search', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['users'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          psychotype: { type: 'string' },
          location: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { query, psychotype, location, limit = 20, offset = 0 } = request.query as any;

      const where: any = {
        id: { not: userId }, // Исключаем текущего пользователя
        isActive: true,
      };

      if (query) {
        where.OR = [
          { username: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ];
      }

      if (psychotype) {
        where.psychotype = psychotype;
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          level: true,
          dogOwnerships: {
            include: {
              dog: {
                include: {
                  photos: true,
                },
              },
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        users: users.map(user => ({
          ...user,
          password: undefined,
          location: user.location ? JSON.parse(user.location) : null,
        })),
        pagination: {
          limit,
          offset,
          total: users.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при поиске пользователей',
      });
    }
  });

  // Выход
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['users'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const token = request.headers.authorization?.replace('Bearer ', '');

      // Деактивируем сессию
      if (token) {
        await prisma.session.updateMany({
          where: {
            userId,
            token,
          },
          data: {
            isActive: false,
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Успешный выход',
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

