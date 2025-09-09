import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getNearbyBones, collectBone, generateBoneSpawns } from '../utils/boneEconomy';

const prisma = new PrismaClient();

// Схемы валидации
const getNearbyBonesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(100).max(5000).optional().default(1000),
});

const collectBoneSchema = z.object({
  spawnId: z.string(),
  dogId: z.string().optional(),
});

// Роут для получения косточек рядом с пользователем
async function getNearbyBonesRoute(
  request: FastifyRequest<{ Querystring: { lat: string; lng: string; radius?: string } }>,
  reply: FastifyReply
) {
  try {
    const { lat, lng, radius } = getNearbyBonesSchema.parse({
      lat: parseFloat(request.query.lat),
      lng: parseFloat(request.query.lng),
      radius: request.query.radius ? parseFloat(request.query.radius) : undefined,
    });

    const bones = await getNearbyBones(lat, lng, radius);

    return reply.send({
      success: true,
      data: {
        bones,
        count: bones.length,
        location: { lat, lng },
        radius,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        message: 'Неверные параметры запроса',
        errors: error.errors,
      });
    }

    console.error('Ошибка при получении косточек:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для сбора косточки
async function collectBoneRoute(
  request: FastifyRequest<{ Body: { spawnId: string; dogId?: string } }>,
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

    const { spawnId, dogId } = collectBoneSchema.parse(request.body);

    // Проверяем, что собака принадлежит пользователю (если указана)
    if (dogId) {
      const dogOwnership = await prisma.dogOwnership.findFirst({
        where: {
          userId,
          dogId,
          isActive: true,
        },
      });

      if (!dogOwnership) {
        return reply.status(403).send({
          success: false,
          message: 'Собака не найдена или не принадлежит вам',
        });
      }
    }

    const result = await collectBone(userId, dogId || null, spawnId);

    if (result.success) {
      return reply.send({
        success: true,
        message: result.message,
        data: {
          bonesEarned: result.bonesEarned,
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

    console.error('Ошибка при сборе косточки:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения статистики по косточкам пользователя
async function getBoneStatsRoute(
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

    // Получаем общую статистику по косточкам
    const totalCollections = await prisma.collectibleCollection.count({
      where: { userId },
    });

    const totalBonesEarned = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EARN',
        currency: 'BONES',
        description: {
          contains: 'косточка',
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Статистика по типам косточек
    const collectionsByType = await prisma.collectibleCollection.groupBy({
      by: ['spawnId'],
      where: { userId },
      _count: {
        spawnId: true,
      },
    });

    // Получаем типы косточек
    const spawnIds = collectionsByType.map(c => c.spawnId);
    const spawns = await prisma.collectibleSpawn.findMany({
      where: {
        id: { in: spawnIds },
      },
      select: {
        id: true,
        type: true,
      },
    });

    const typeStats = spawns.reduce((acc, spawn) => {
      const collection = collectionsByType.find(c => c.spawnId === spawn.id);
      if (collection) {
        acc[spawn.type] = (acc[spawn.type] || 0) + collection._count.spawnId;
      }
      return acc;
    }, {} as Record<string, number>);

    // Достижения по косточкам
    const boneAchievements = await prisma.achievement.findMany({
      where: {
        userId,
        type: 'COLLECTION',
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return reply.send({
      success: true,
      data: {
        totalCollections,
        totalBonesEarned: totalBonesEarned._sum.amount || 0,
        typeStats,
        achievements: boneAchievements,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении статистики косточек:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для получения истории сбора косточек
async function getBoneHistoryRoute(
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

    const collections = await prisma.collectibleCollection.findMany({
      where: { userId },
      include: {
        spawn: {
          select: {
            type: true,
            value: true,
            location: true,
          },
        },
        dog: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        collectedAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    const total = await prisma.collectibleCollection.count({
      where: { userId },
    });

    return reply.send({
      success: true,
      data: {
        collections: collections.map(collection => ({
          id: collection.id,
          type: collection.spawn.type,
          value: collection.spawn.value,
          location: JSON.parse(collection.spawn.location),
          dogName: collection.dog?.name,
          collectedAt: collection.collectedAt,
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
    console.error('Ошибка при получении истории косточек:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Роут для принудительной генерации косточек (только для админов)
async function generateBonesRoute(
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

    // Проверяем права администратора
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId },
    });

    if (!adminProfile) {
      return reply.status(403).send({
        success: false,
        message: 'Недостаточно прав для выполнения операции',
      });
    }

    await generateBoneSpawns();

    return reply.send({
      success: true,
      message: 'Генерация косточек запущена',
    });
  } catch (error) {
    console.error('Ошибка при генерации косточек:', error);
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
    });
  }
}

// Регистрация роутов
export default async function bonesRoutes(fastify: FastifyInstance) {
  // Получение косточек рядом с пользователем
  fastify.get('/nearby', {
    schema: {
      description: 'Получить косточки рядом с пользователем',
      tags: ['bones'],
      querystring: {
        type: 'object',
        properties: {
          lat: { type: 'string', description: 'Широта' },
          lng: { type: 'string', description: 'Долгота' },
          radius: { type: 'string', description: 'Радиус поиска в метрах (по умолчанию 1000)' },
        },
        required: ['lat', 'lng'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                bones: { type: 'array' },
                count: { type: 'number' },
                location: { type: 'object' },
                radius: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, getNearbyBonesRoute);

  // Сбор косточки
  fastify.post('/collect', {
    schema: {
      description: 'Собрать косточку',
      tags: ['bones'],
      body: {
        type: 'object',
        properties: {
          spawnId: { type: 'string', description: 'ID косточки для сбора' },
          dogId: { type: 'string', description: 'ID собаки (опционально)' },
        },
        required: ['spawnId'],
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
                bonesEarned: { type: 'number' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, collectBoneRoute);

  // Статистика по косточкам
  fastify.get('/stats', {
    schema: {
      description: 'Получить статистику по косточкам пользователя',
      tags: ['bones'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalCollections: { type: 'number' },
                totalBonesEarned: { type: 'number' },
                typeStats: { type: 'object' },
                achievements: { type: 'array' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getBoneStatsRoute);

  // История сбора косточек
  fastify.get('/history', {
    schema: {
      description: 'Получить историю сбора косточек',
      tags: ['bones'],
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
                collections: { type: 'array' },
                pagination: { type: 'object' },
              },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, getBoneHistoryRoute);

  // Генерация косточек (только для админов)
  fastify.post('/generate', {
    schema: {
      description: 'Принудительная генерация косточек (только для админов)',
      tags: ['bones', 'admin'],
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
  }, generateBonesRoute);
}
