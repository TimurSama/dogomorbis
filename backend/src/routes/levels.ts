import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getUserStats, getLeaderboard, addExperience, LEVEL_SYSTEM } from '../utils/levelSystem';

const prisma = new PrismaClient();

// Схемы валидации
const addExperienceSchema = z.object({
  action: z.enum([
    'CREATE_POST', 'LIKE_POST', 'COMMENT_POST', 'SHARE_POST',
    'ADD_DOG_PROFILE', 'UPDATE_DOG_PROFILE', 'ADD_DOG_PHOTO',
    'LOG_WALK', 'LOG_TRAINING', 'LOG_FEEDING', 'LOG_VET_VISIT',
    'COLLECT_BONE', 'COLLECT_YARN_BALL', 'COLLECT_TREAT', 'COLLECT_TOY', 'COLLECT_GOLDEN_BONE',
    'JOIN_EVENT', 'CREATE_EVENT', 'COMPLETE_EVENT',
    'EARN_ACHIEVEMENT', 'EARN_BADGE',
    'REFER_FRIEND', 'BE_REFERRED',
    'DAILY_LOGIN', 'WEEKLY_ACTIVE', 'MONTHLY_ACTIVE',
    'COMPLETE_PROFILE', 'VERIFY_EMAIL', 'VERIFY_PHONE', 'UPLOAD_AVATAR'
  ]),
  metadata: z.any().optional(),
});

// Роут для получения статистики пользователя
async function getUserStatsRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Необходима авторизация',
      });
    }

    const stats = await getUserStats(userId);

    return reply.send({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Ошибка при получении статистики пользователя:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения лидерборда
async function getLeaderboardRoute(
  request: FastifyRequest<{ Querystring: { limit?: string } }>,
  reply: FastifyReply
) {
  try {
    const limit = Math.min(parseInt(request.query.limit || '50'), 100);
    const leaderboard = await getLeaderboard(limit);

    return reply.send({
      success: true,
      data: {
        leaderboard,
        total: leaderboard.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении лидерборда:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для добавления опыта (внутренний API)
async function addExperienceRoute(
  request: FastifyRequest<{ Body: { action: string; metadata?: any } }>,
  reply: FastifyReply
) {
  try {
    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Необходима авторизация',
      });
    }

    const { action, metadata } = addExperienceSchema.parse(request.body);

    const result = await addExperience(userId, action as any, metadata);

    return reply.send({
      success: result.success,
      message: result.message,
      data: {
        experienceAdded: result.experienceAdded,
        newLevel: result.newLevel,
        leveledUp: result.leveledUp,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Неверные данные запроса',
        errors: error.errors,
      });
    }

    console.error('Ошибка при добавлении опыта:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения информации о системе уровней
async function getLevelSystemInfoRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    return reply.send({
      success: true,
      data: {
        levels: LEVEL_SYSTEM,
        totalLevels: LEVEL_SYSTEM.length,
        maxLevel: LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1].level,
        maxExperience: LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1].maxExperience,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении информации о системе уровней:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения истории опыта пользователя
async function getExperienceHistoryRoute(
  request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
  reply: FastifyReply
) {
  try {
    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Необходима авторизация',
      });
    }

    const page = parseInt(request.query.page || '1');
    const limit = Math.min(parseInt(request.query.limit || '20'), 100);
    const offset = (page - 1) * limit;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EARN',
        currency: 'EXPERIENCE',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.transaction.count({
      where: {
        userId,
        type: 'EARN',
        currency: 'EXPERIENCE',
      },
    });

    const history = transactions.map(transaction => {
      const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : {};
      return {
        id: transaction.id,
        action: metadata.action || 'Unknown',
        amount: transaction.amount,
        description: transaction.description,
        metadata: metadata,
        createdAt: transaction.createdAt,
      };
    });

    return reply.send({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при получении истории опыта:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения достижений пользователя
async function getUserAchievementsRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Необходима авторизация',
      });
    }

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    const badges = await prisma.badge.findMany({
      where: { userId },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return reply.send({
      success: true,
      data: {
        achievements,
        badges,
        totalAchievements: achievements.length,
        totalBadges: badges.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении достижений пользователя:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Регистрация роутов
export default async function levelsRoutes(fastify: FastifyInstance) {
  // Получение статистики пользователя
  fastify.get('/stats', {
    schema: {
      description: 'Получить статистику уровня пользователя',
      tags: ['levels'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                level: { type: 'object' },
                progress: { type: 'object' },
                totalExperience: { type: 'number' },
                experienceThisWeek: { type: 'number' },
                experienceThisMonth: { type: 'number' },
                topActions: { type: 'array' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getUserStatsRoute);

  // Получение лидерборда
  fastify.get('/leaderboard', {
    schema: {
      description: 'Получить лидерборд пользователей',
      tags: ['levels'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string', description: 'Количество пользователей в лидерборде' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                leaderboard: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, getLeaderboardRoute);

  // Добавление опыта
  fastify.post('/experience', {
    schema: {
      description: 'Добавить опыт пользователю',
      tags: ['levels'],
      body: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'Действие за которое начисляется опыт' },
          metadata: { type: 'object', description: 'Дополнительные данные' },
        },
        required: ['action'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                experienceAdded: { type: 'number' },
                newLevel: { type: 'object' },
                leveledUp: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, addExperienceRoute);

  // Информация о системе уровней
  fastify.get('/system', {
    schema: {
      description: 'Получить информацию о системе уровней',
      tags: ['levels'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                levels: { type: 'array' },
                totalLevels: { type: 'number' },
                maxLevel: { type: 'number' },
                maxExperience: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, getLevelSystemInfoRoute);

  // История опыта
  fastify.get('/history', {
    schema: {
      description: 'Получить историю получения опыта',
      tags: ['levels'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', description: 'Номер страницы' },
          limit: { type: 'string', description: 'Количество записей на странице' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                history: { type: 'array' },
                pagination: { type: 'object' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getExperienceHistoryRoute);

  // Достижения пользователя
  fastify.get('/achievements', {
    schema: {
      description: 'Получить достижения и значки пользователя',
      tags: ['levels'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                achievements: { type: 'array' },
                badges: { type: 'array' },
                totalAchievements: { type: 'number' },
                totalBadges: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getUserAchievementsRoute);
}
