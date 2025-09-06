import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createAdminProfileSchema = z.object({
  role: z.enum(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
  permissions: z.array(z.string()).optional(),
});

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

const createNotificationSchema = z.object({
  userId: z.string().optional(),
  type: z.enum(['MATCH', 'INVITE', 'ACHIEVEMENT', 'LEVEL_UP', 'REFERRAL', 'DAO', 'SYSTEM', 'PARTNER']),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  data: z.record(z.any()).optional(),
});

export default async function adminRoutes(fastify: FastifyInstance) {
  // Создание профиля администратора
  fastify.post('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      body: createAdminProfileSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createAdminProfileSchema.parse(request.body);

      // Проверяем, не существует ли уже профиль администратора
      const existingProfile = await prisma.adminProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return reply.status(400).send({
          success: false,
          message: 'Профиль администратора уже существует',
        });
      }

      const profile = await prisma.adminProfile.create({
        data: {
          userId,
          role: data.role,
          permissions: data.permissions ? JSON.stringify(data.permissions) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Профиль администратора создан',
        profile: {
          ...profile,
          permissions: profile.permissions ? JSON.parse(profile.permissions) : [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании профиля администратора',
      });
    }
  });

  // Получение профиля администратора
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const profile = await prisma.adminProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      if (!profile) {
        return reply.status(404).send({
          success: false,
          message: 'Профиль администратора не найден',
        });
      }

      return reply.send({
        success: true,
        profile: {
          ...profile,
          permissions: profile.permissions ? JSON.parse(profile.permissions) : [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении профиля администратора',
      });
    }
  });

  // Получение статистики
  fastify.get('/stats', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      // Получаем общую статистику
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true },
      });
      const premiumUsers = await prisma.user.count({
        where: { isPremium: true },
      });

      const totalDogs = await prisma.dog.count();
      const totalPosts = await prisma.post.count();
      const totalMatches = await prisma.match.count();
      const totalBookings = await prisma.booking.count();

      // Статистика по партнерам
      const totalPartners = await prisma.partnerProfile.count();
      const verifiedPartners = await prisma.partnerProfile.count({
        where: { isVerified: true },
      });

      // Статистика по DAO
      const totalProposals = await prisma.daoProposal.count();
      const totalVotes = await prisma.daoVote.count();

      // Статистика по транзакциям
      const totalTransactions = await prisma.transaction.count();
      const bonesTransactions = await prisma.transaction.count({
        where: { currency: 'BONES' },
      });
      const yarnTransactions = await prisma.transaction.count({
        where: { currency: 'YARN' },
      });

      return reply.send({
        success: true,
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            premium: premiumUsers,
          },
          content: {
            dogs: totalDogs,
            posts: totalPosts,
            matches: totalMatches,
            bookings: totalBookings,
          },
          partners: {
            total: totalPartners,
            verified: verifiedPartners,
          },
          dao: {
            proposals: totalProposals,
            votes: totalVotes,
          },
          economy: {
            totalTransactions,
            bonesTransactions,
            yarnTransactions,
          },
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении статистики',
      });
    }
  });

  // Получение списка пользователей
  fastify.get('/users', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
          isPremium: { type: 'boolean' },
          isVerified: { type: 'boolean' },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { isActive, isPremium, isVerified, limit = 50, offset = 0 } = request.query as any;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      const where: any = {};

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (isPremium !== undefined) {
        where.isPremium = isPremium;
      }

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      const users = await prisma.user.findMany({
        where,
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
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              posts: true,
              dogOwnerships: true,
              matchesAsUser1: true,
              matchesAsUser2: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        users,
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
        message: 'Ошибка при получении списка пользователей',
      });
    }
  });

  // Обновление пользователя
  fastify.put('/users/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: updateUserSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const adminUserId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = updateUserSchema.parse(request.body);

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: adminUserId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      const user = await prisma.user.update({
        where: { id },
        data,
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
          createdAt: true,
          lastLoginAt: true,
        },
      });

      return reply.send({
        success: true,
        message: 'Пользователь обновлен',
        user,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении пользователя',
      });
    }
  });

  // Создание уведомления
  fastify.post('/notifications', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      body: createNotificationSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const adminUserId = (request as any).user.userId;
      const data = createNotificationSchema.parse(request.body);

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: adminUserId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      if (data.userId) {
        // Отправляем уведомление конкретному пользователю
        const notification = await prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data ? JSON.stringify(data.data) : null,
          },
        });

        return reply.status(201).send({
          success: true,
          message: 'Уведомление отправлено',
          notification,
        });
      } else {
        // Отправляем уведомление всем пользователям
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        const notifications = await prisma.notification.createMany({
          data: users.map(user => ({
            userId: user.id,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data ? JSON.stringify(data.data) : null,
          })),
        });

        return reply.status(201).send({
          success: true,
          message: `Уведомление отправлено ${users.length} пользователям`,
          count: notifications.count,
        });
      }
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании уведомления',
      });
    }
  });

  // Получение списка партнеров
  fastify.get('/partners', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          isVerified: { type: 'boolean' },
          isActive: { type: 'boolean' },
          category: { type: 'string' },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { isVerified, isActive, category, limit = 50, offset = 0 } = request.query as any;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      const where: any = {};

      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (category) {
        where.category = category;
      }

      const partners = await prisma.partnerProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              email: true,
            },
          },
          _count: {
            select: {
              services: true,
              adoptionListings: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        partners: partners.map(partner => ({
          ...partner,
          location: partner.location ? JSON.parse(partner.location) : null,
          contact: partner.contact ? JSON.parse(partner.contact) : null,
        })),
        pagination: {
          limit,
          offset,
          total: partners.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении списка партнеров',
      });
    }
  });

  // Верификация партнера
  fastify.put('/partners/:id/verify', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          isVerified: { type: 'boolean' },
        },
        required: ['isVerified'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const adminUserId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const { isVerified } = request.body as any;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: adminUserId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      const partner = await prisma.partnerProfile.update({
        where: { id },
        data: { isVerified },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: `Партнер ${isVerified ? 'верифицирован' : 'деверифицирован'}`,
        partner: {
          ...partner,
          location: partner.location ? JSON.parse(partner.location) : null,
          contact: partner.contact ? JSON.parse(partner.contact) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при верификации партнера',
      });
    }
  });

  // Получение логов системы
  fastify.get('/logs', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['admin'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          level: { type: 'string' },
          limit: { type: 'number', default: 100 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { level, limit = 100, offset = 0 } = request.query as any;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав администратора',
        });
      }

      // В реальном приложении здесь будет запрос к системе логирования
      // Пока возвращаем примеры логов
      const logs = [
        {
          id: '1',
          level: 'info',
          message: 'User registered',
          timestamp: new Date(),
          userId: 'user123',
        },
        {
          id: '2',
          level: 'error',
          message: 'Database connection failed',
          timestamp: new Date(),
          userId: null,
        },
      ];

      return reply.send({
        success: true,
        logs,
        pagination: {
          limit,
          offset,
          total: logs.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении логов',
      });
    }
  });
}

