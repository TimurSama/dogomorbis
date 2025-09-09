import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { 
  getAvailableAchievements, 
  getAchievementsByCategory, 
  getAchievementsByType,
  checkAchievements 
} from '../utils/achievementSystem';

const prisma = new PrismaClient();

// Роут для получения всех доступных достижений
async function getAvailableAchievementsRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const achievements = getAvailableAchievements();

    return reply.send({
      success: true,
      data: {
        achievements,
        total: achievements.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении достижений:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения достижений по категории
async function getAchievementsByCategoryRoute(
  request: FastifyRequest<{ Params: { category: string } }>,
  reply: FastifyReply
) {
  try {
    const { category } = request.params;
    const achievements = getAchievementsByCategory(category);

    return reply.send({
      success: true,
      data: {
        achievements,
        category,
        total: achievements.length,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении достижений по категории:', error);
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

    // Получаем все доступные достижения для сравнения
    const availableAchievements = getAvailableAchievements();
    const userAchievementIds = achievements.map(a => a.title);
    
    const notEarnedAchievements = availableAchievements.filter(
      achievement => !userAchievementIds.includes(achievement.title)
    );

    return reply.send({
      success: true,
      data: {
        earned: achievements,
        notEarned: notEarnedAchievements,
        badges,
        stats: {
          totalEarned: achievements.length,
          totalAvailable: availableAchievements.length,
          totalBadges: badges.length,
          completionRate: Math.round((achievements.length / availableAchievements.length) * 100),
        },
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

// Роут для принудительной проверки достижений (для тестирования)
async function checkUserAchievementsRoute(
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

    await checkAchievements(userId, 'MANUAL_CHECK');

    return reply.send({
      success: true,
      message: 'Проверка достижений завершена',
    });
  } catch (error) {
    console.error('Ошибка при проверке достижений:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Регистрация роутов
export default async function achievementsRoutes(fastify: FastifyInstance) {
  // Получение всех доступных достижений
  fastify.get('/available', {
    schema: {
      description: 'Получить все доступные достижения',
      tags: ['achievements'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                achievements: { type: 'array' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, getAvailableAchievementsRoute);

  // Получение достижений по категории
  fastify.get('/category/:category', {
    schema: {
      description: 'Получить достижения по категории',
      tags: ['achievements'],
      params: {
        type: 'object',
        properties: {
          category: { type: 'string' },
        },
        required: ['category'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                achievements: { type: 'array' },
                category: { type: 'string' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, getAchievementsByCategoryRoute);

  // Получение достижений пользователя
  fastify.get('/user', {
    schema: {
      description: 'Получить достижения и значки пользователя',
      tags: ['achievements'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                earned: { type: 'array' },
                notEarned: { type: 'array' },
                badges: { type: 'array' },
                stats: { type: 'object' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getUserAchievementsRoute);

  // Проверка достижений пользователя
  fastify.post('/check', {
    schema: {
      description: 'Принудительная проверка достижений пользователя',
      tags: ['achievements'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, checkUserAchievementsRoute);
}
