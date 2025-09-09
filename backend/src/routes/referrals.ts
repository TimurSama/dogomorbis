import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { 
  createReferralCode, 
  processReferralRegistration, 
  getReferralStats, 
  getReferralLink,
  validateReferralCode 
} from '../utils/referralSystem';

const prisma = new PrismaClient();

// Схемы валидации
const processReferralSchema = z.object({
  referralCode: z.string().min(1).max(20),
});

// Роут для создания реферального кода
async function createReferralCodeRoute(
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

    const result = await createReferralCode(userId);

    if (result.success) {
      return reply.send({
        success: true,
        message: result.message,
        data: {
          code: result.code,
          referralLink: getReferralLink(result.code!),
        },
      });
    } else {
      return reply.status(400).send({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Ошибка при создании реферального кода:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для обработки реферальной регистрации
async function processReferralRoute(
  request: FastifyRequest<{ Body: { referralCode: string } }>,
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

    const { referralCode } = processReferralSchema.parse(request.body);

    const result = await processReferralRegistration(userId, referralCode);

    if (result.success) {
      return reply.send({
        success: true,
        message: result.message,
        data: {
          referrerId: result.referrerId,
          rewards: result.rewards,
        },
      });
    } else {
      return reply.status(400).send({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Неверные данные запроса',
        errors: error.errors,
      });
    }

    console.error('Ошибка при обработке реферальной регистрации:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения статистики рефералов
async function getReferralStatsRoute(
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

    const stats = await getReferralStats(userId);

    return reply.send({
      success: true,
      data: {
        ...stats,
        referralLink: stats.referralCode ? getReferralLink(stats.referralCode) : null,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении статистики рефералов:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для валидации реферального кода
async function validateReferralCodeRoute(
  request: FastifyRequest<{ Querystring: { code: string } }>,
  reply: FastifyReply
) {
  try {
    const { code } = request.query;

    if (!code) {
      return reply.status(400).send({
        success: false,
        message: 'Код не указан',
      });
    }

    const result = await validateReferralCode(code);

    return reply.send({
      success: result.valid,
      message: result.message,
      data: result.codeInfo,
    });
  } catch (error) {
    console.error('Ошибка при валидации реферального кода:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения истории рефералов
async function getReferralHistoryRoute(
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

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
        code: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.referral.count({
      where: { referrerId: userId },
    });

    return reply.send({
      success: true,
      data: {
        referrals: referrals.map(referral => ({
          id: referral.id,
          status: referral.status,
          reward: referral.reward,
          createdAt: referral.createdAt,
          referred: referral.referred,
          code: referral.code.code,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Ошибка при получении истории рефералов:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения информации о реферальной программе
async function getReferralProgramInfoRoute(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    return reply.send({
      success: true,
      data: {
        program: {
          referrerReward: 100,
          referredReward: 50,
          referrerExperience: 100,
          referredExperience: 50,
          maxReferralsPerUser: 100,
          codeLength: 8,
          codeExpiryDays: 365,
        },
        benefits: [
          'Получайте 100 косточек за каждого приглашенного друга',
          'Ваш друг получает 50 косточек за регистрацию',
          'Зарабатывайте опыт за каждое приглашение',
          'Отслеживайте статистику ваших рефералов',
          'Получайте уведомления о новых регистрациях',
        ],
        howItWorks: [
          'Создайте свой реферальный код в профиле',
          'Поделитесь ссылкой с друзьями',
          'Друг регистрируется по вашей ссылке',
          'Вы оба получаете награды!',
        ],
      },
    });
  } catch (error) {
    console.error('Ошибка при получении информации о программе:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Регистрация роутов
export default async function referralsRoutes(fastify: FastifyInstance) {
  // Создание реферального кода
  fastify.post('/code', {
    schema: {
      description: 'Создать реферальный код для пользователя',
      tags: ['referrals'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                referralLink: { type: 'string' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, createReferralCodeRoute);

  // Обработка реферальной регистрации
  fastify.post('/process', {
    schema: {
      description: 'Обработать реферальную регистрацию',
      tags: ['referrals'],
      body: {
        type: 'object',
        properties: {
          referralCode: { type: 'string', description: 'Реферальный код' },
        },
        required: ['referralCode'],
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
                referrerId: { type: 'string' },
                rewards: { type: 'object' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, processReferralRoute);

  // Получение статистики рефералов
  fastify.get('/stats', {
    schema: {
      description: 'Получить статистику рефералов пользователя',
      tags: ['referrals'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalReferrals: { type: 'number' },
                successfulReferrals: { type: 'number' },
                pendingReferrals: { type: 'number' },
                totalRewards: { type: 'number' },
                referralCode: { type: 'string' },
                referralLink: { type: 'string' },
                recentReferrals: { type: 'array' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getReferralStatsRoute);

  // Валидация реферального кода
  fastify.get('/validate', {
    schema: {
      description: 'Проверить валидность реферального кода',
      tags: ['referrals'],
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Реферальный код для проверки' },
        },
        required: ['code'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
  }, validateReferralCodeRoute);

  // История рефералов
  fastify.get('/history', {
    schema: {
      description: 'Получить историю рефералов пользователя',
      tags: ['referrals'],
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
                referrals: { type: 'array' },
                pagination: { type: 'object' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getReferralHistoryRoute);

  // Информация о реферальной программе
  fastify.get('/info', {
    schema: {
      description: 'Получить информацию о реферальной программе',
      tags: ['referrals'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                program: { type: 'object' },
                benefits: { type: 'array' },
                howItWorks: { type: 'array' },
              },
            },
          },
        },
      },
    },
  }, getReferralProgramInfoRoute);
}
