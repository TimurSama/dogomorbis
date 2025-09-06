import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createJournalEntrySchema = z.object({
  dogId: z.string().optional(),
  mood: z.enum(['HAPPY', 'EXCITED', 'CALM', 'ANXIOUS', 'SAD', 'ANGRY', 'NEUTRAL']),
  activity: z.enum(['WALK', 'PLAY', 'TRAINING', 'FEEDING', 'GROOMING', 'VET_VISIT', 'SOCIAL', 'REST']),
  content: z.string().min(1).max(2000),
  images: z.array(z.string().url()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
});

const createGoalSchema = z.object({
  dogId: z.string().optional(),
  type: z.enum(['WALKING', 'TRAINING', 'SOCIAL', 'HEALTH', 'BEHAVIOR', 'CUSTOM']),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  target: z.number().positive().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  target: z.number().positive().optional(),
  current: z.number().min(0).optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export default async function journalRoutes(fastify: FastifyInstance) {
  // Создание записи в журнале
  fastify.post('/entries', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      body: createJournalEntrySchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createJournalEntrySchema.parse(request.body);

      // Проверяем права на собаку
      if (data.dogId) {
        const ownership = await prisma.dogOwnership.findFirst({
          where: {
            dogId: data.dogId,
            userId,
            isActive: true,
          },
        });

        if (!ownership) {
          return reply.status(403).send({
            success: false,
            message: 'У вас нет прав на эту собаку',
          });
        }
      }

      const entry = await prisma.journalEntry.create({
        data: {
          userId,
          dogId: data.dogId,
          mood: data.mood,
          activity: data.activity,
          content: data.content,
          images: data.images ? JSON.stringify(data.images) : null,
          location: data.location ? JSON.stringify(data.location) : null,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      // Начисляем косточки за ведение журнала
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 3,
          description: 'Запись в журнале',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Запись в журнале создана',
        entry: {
          ...entry,
          images: entry.images ? JSON.parse(entry.images) : [],
          location: entry.location ? JSON.parse(entry.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании записи в журнале',
      });
    }
  });

  // Получение записей журнала
  fastify.get('/entries', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
          mood: { type: 'string' },
          activity: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId, mood, activity, limit = 20, offset = 0 } = request.query as any;

      const where: any = { userId };

      if (dogId) {
        where.dogId = dogId;
      }

      if (mood) {
        where.mood = mood;
      }

      if (activity) {
        where.activity = activity;
      }

      const entries = await prisma.journalEntry.findMany({
        where,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        entries: entries.map(entry => ({
          ...entry,
          images: entry.images ? JSON.parse(entry.images) : [],
          location: entry.location ? JSON.parse(entry.location) : null,
        })),
        pagination: {
          limit,
          offset,
          total: entries.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении записей журнала',
      });
    }
  });

  // Получение конкретной записи
  fastify.get('/entries/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
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

      const entry = await prisma.journalEntry.findFirst({
        where: {
          id,
          userId,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      if (!entry) {
        return reply.status(404).send({
          success: false,
          message: 'Запись в журнале не найдена',
        });
      }

      return reply.send({
        success: true,
        entry: {
          ...entry,
          images: entry.images ? JSON.parse(entry.images) : [],
          location: entry.location ? JSON.parse(entry.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении записи журнала',
      });
    }
  });

  // Создание цели
  fastify.post('/goals', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      body: createGoalSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createGoalSchema.parse(request.body);

      // Проверяем права на собаку
      if (data.dogId) {
        const ownership = await prisma.dogOwnership.findFirst({
          where: {
            dogId: data.dogId,
            userId,
            isActive: true,
          },
        });

        if (!ownership) {
          return reply.status(403).send({
            success: false,
            message: 'У вас нет прав на эту собаку',
          });
        }
      }

      const goal = await prisma.goal.create({
        data: {
          userId,
          dogId: data.dogId,
          type: data.type,
          title: data.title,
          description: data.description,
          target: data.target,
          unit: data.unit,
          deadline: data.deadline ? new Date(data.deadline) : null,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      // Начисляем косточки за создание цели
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 5,
          description: 'Создание цели',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Цель создана',
        goal,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании цели',
      });
    }
  });

  // Получение целей
  fastify.get('/goals', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
          type: { type: 'string' },
          isCompleted: { type: 'boolean' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId, type, isCompleted, limit = 20, offset = 0 } = request.query as any;

      const where: any = { userId };

      if (dogId) {
        where.dogId = dogId;
      }

      if (type) {
        where.type = type;
      }

      if (isCompleted !== undefined) {
        where.isCompleted = isCompleted;
      }

      const goals = await prisma.goal.findMany({
        where,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        goals,
        pagination: {
          limit,
          offset,
          total: goals.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении целей',
      });
    }
  });

  // Обновление цели
  fastify.put('/goals/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: updateGoalSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = updateGoalSchema.parse(request.body);

      // Проверяем, является ли пользователь владельцем цели
      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!goal) {
        return reply.status(404).send({
          success: false,
          message: 'Цель не найдена или у вас нет прав на её редактирование',
        });
      }

      const updateData: any = { ...data };
      if (data.deadline) {
        updateData.deadline = new Date(data.deadline);
      }

      // Если цель завершена, устанавливаем дату завершения
      if (data.isCompleted && !goal.isCompleted) {
        updateData.completedAt = new Date();
        
        // Начисляем косточки за завершение цели
        await prisma.transaction.create({
          data: {
            userId,
            type: 'EARN',
            currency: 'BONES',
            amount: 20,
            description: 'Завершение цели',
          },
        });
      }

      const updatedGoal = await prisma.goal.update({
        where: { id },
        data: updateData,
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
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Цель обновлена',
        goal: updatedGoal,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении цели',
      });
    }
  });

  // Удаление цели
  fastify.delete('/goals/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
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

      // Проверяем, является ли пользователь владельцем цели
      const goal = await prisma.goal.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!goal) {
        return reply.status(404).send({
          success: false,
          message: 'Цель не найдена или у вас нет прав на её удаление',
        });
      }

      await prisma.goal.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Цель удалена',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении цели',
      });
    }
  });

  // Получение статистики журнала
  fastify.get('/stats', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['journal'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
          period: { type: 'string', enum: ['week', 'month', 'year'] },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId, period = 'month' } = request.query as any;

      const where: any = { userId };

      if (dogId) {
        where.dogId = dogId;
      }

      // Определяем период
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      where.createdAt = {
        gte: startDate,
      };

      // Получаем записи за период
      const entries = await prisma.journalEntry.findMany({
        where,
        select: {
          mood: true,
          activity: true,
          createdAt: true,
        },
      });

      // Анализируем статистику
      const moodStats: Record<string, number> = {};
      const activityStats: Record<string, number> = {};
      const dailyStats: Record<string, number> = {};

      entries.forEach(entry => {
        // Статистика настроения
        moodStats[entry.mood] = (moodStats[entry.mood] || 0) + 1;
        
        // Статистика активности
        activityStats[entry.activity] = (activityStats[entry.activity] || 0) + 1;
        
        // Статистика по дням
        const day = entry.createdAt.toISOString().split('T')[0];
        dailyStats[day] = (dailyStats[day] || 0) + 1;
      });

      // Получаем статистику целей
      const goals = await prisma.goal.findMany({
        where: {
          userId,
          ...(dogId && { dogId }),
        },
      });

      const goalsStats = {
        total: goals.length,
        completed: goals.filter(g => g.isCompleted).length,
        active: goals.filter(g => !g.isCompleted).length,
        byType: goals.reduce((acc, goal) => {
          acc[goal.type] = (acc[goal.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return reply.send({
        success: true,
        stats: {
          period,
          entries: {
            total: entries.length,
            mood: moodStats,
            activity: activityStats,
            daily: dailyStats,
          },
          goals: goalsStats,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении статистики журнала',
      });
    }
  });
}

