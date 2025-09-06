import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const transferSchema = z.object({
  toUserId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['BONES', 'YARN']),
  message: z.string().optional(),
});

const purchaseSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(['PRODUCT', 'SERVICE', 'PREMIUM']),
  amount: z.number().positive(),
  currency: z.enum(['BONES', 'YARN']),
});

export default async function walletRoutes(fastify: FastifyInstance) {
  // Получение баланса
  fastify.get('/balance', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Получаем все транзакции пользователя
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Вычисляем баланс
      let bonesBalance = 0;
      let yarnBalance = 0;

      transactions.forEach(transaction => {
        if (transaction.currency === 'BONES') {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            bonesBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            bonesBalance -= transaction.amount;
          }
        } else if (transaction.currency === 'YARN') {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            yarnBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            yarnBalance -= transaction.amount;
          }
        }
      });

      // Получаем уровень пользователя
      const level = await prisma.level.findUnique({
        where: { userId },
        include: {
          badges: true,
        },
      });

      return reply.send({
        success: true,
        balance: {
          bones: Math.max(0, bonesBalance),
          yarn: Math.max(0, yarnBalance),
        },
        level: level || {
          level: 1,
          experience: 0,
          tier: 'BRONZE',
          badges: [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении баланса',
      });
    }
  });

  // Получение истории транзакций
  fastify.get('/transactions', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          currency: { type: 'string', enum: ['BONES', 'YARN', 'ALL'] },
          type: { type: 'string' },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { currency = 'ALL', type, limit = 50, offset = 0 } = request.query as any;

      const where: any = { userId };

      if (currency !== 'ALL') {
        where.currency = currency;
      }

      if (type) {
        where.type = type;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return reply.send({
        success: true,
        transactions,
        pagination: {
          limit,
          offset,
          total: transactions.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении истории транзакций',
      });
    }
  });

  // Перевод валюты другому пользователю
  fastify.post('/transfer', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
      body: transferSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = transferSchema.parse(request.body);

      // Проверяем, существует ли получатель
      const recipient = await prisma.user.findUnique({
        where: { id: data.toUserId },
      });

      if (!recipient) {
        return reply.status(404).send({
          success: false,
          message: 'Получатель не найден',
        });
      }

      if (recipient.id === userId) {
        return reply.status(400).send({
          success: false,
          message: 'Нельзя переводить самому себе',
        });
      }

      // Проверяем баланс отправителя
      const senderTransactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let senderBalance = 0;
      senderTransactions.forEach(transaction => {
        if (transaction.currency === data.currency) {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            senderBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            senderBalance -= transaction.amount;
          }
        }
      });

      if (senderBalance < data.amount) {
        return reply.status(400).send({
          success: false,
          message: 'Недостаточно средств',
        });
      }

      // Создаем транзакции
      await prisma.$transaction(async (tx) => {
        // Списание у отправителя
        await tx.transaction.create({
          data: {
            userId,
            type: 'TRANSFER',
            currency: data.currency,
            amount: data.amount,
            description: `Перевод пользователю ${recipient.username}${data.message ? `: ${data.message}` : ''}`,
          },
        });

        // Зачисление получателю
        await tx.transaction.create({
          data: {
            userId: data.toUserId,
            type: 'EARN',
            currency: data.currency,
            amount: data.amount,
            description: `Перевод от пользователя ${(request as any).user.username}${data.message ? `: ${data.message}` : ''}`,
          },
        });
      });

      return reply.send({
        success: true,
        message: 'Перевод выполнен успешно',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при выполнении перевода',
      });
    }
  });

  // Покупка товара или услуги
  fastify.post('/purchase', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
      body: purchaseSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = purchaseSchema.parse(request.body);

      // Проверяем баланс пользователя
      const userTransactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let userBalance = 0;
      userTransactions.forEach(transaction => {
        if (transaction.currency === data.currency) {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            userBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            userBalance -= transaction.amount;
          }
        }
      });

      if (userBalance < data.amount) {
        return reply.status(400).send({
          success: false,
          message: 'Недостаточно средств',
        });
      }

      // Создаем транзакцию покупки
      await prisma.transaction.create({
        data: {
          userId,
          type: 'SPEND',
          currency: data.currency,
          amount: data.amount,
          description: `Покупка ${data.itemType.toLowerCase()}: ${data.itemId}`,
          metadata: JSON.stringify({
            itemId: data.itemId,
            itemType: data.itemType,
          }),
        },
      });

      // В зависимости от типа покупки выполняем дополнительные действия
      if (data.itemType === 'PREMIUM') {
        await prisma.user.update({
          where: { id: userId },
          data: { isPremium: true },
        });
      }

      return reply.send({
        success: true,
        message: 'Покупка выполнена успешно',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при выполнении покупки',
      });
    }
  });

  // Получение достижений
  fastify.get('/achievements', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const achievements = await prisma.achievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
      });

      return reply.send({
        success: true,
        achievements,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении достижений',
      });
    }
  });

  // Получение значков
  fastify.get('/badges', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const level = await prisma.level.findUnique({
        where: { userId },
        include: {
          badges: true,
        },
      });

      return reply.send({
        success: true,
        badges: level?.badges || [],
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении значков',
      });
    }
  });

  // Получение статистики
  fastify.get('/stats', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Получаем статистику транзакций
      const transactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let totalEarned = { bones: 0, yarn: 0 };
      let totalSpent = { bones: 0, yarn: 0 };

      transactions.forEach(transaction => {
        if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
          if (transaction.currency === 'BONES') {
            totalEarned.bones += transaction.amount;
          } else if (transaction.currency === 'YARN') {
            totalEarned.yarn += transaction.amount;
          }
        } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
          if (transaction.currency === 'BONES') {
            totalSpent.bones += transaction.amount;
          } else if (transaction.currency === 'YARN') {
            totalSpent.yarn += transaction.amount;
          }
        }
      });

      // Получаем статистику активности
      const postsCount = await prisma.post.count({
        where: { userId },
      });

      const commentsCount = await prisma.comment.count({
        where: { userId },
      });

      const likesCount = await prisma.like.count({
        where: { userId },
      });

      const walksCount = await prisma.transaction.count({
        where: {
          userId,
          description: { contains: 'прогулка' },
        },
      });

      return reply.send({
        success: true,
        stats: {
          earnings: totalEarned,
          spending: totalSpent,
          activity: {
            posts: postsCount,
            comments: commentsCount,
            likes: likesCount,
            walks: walksCount,
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

  // Начисление бонуса (для администраторов)
  fastify.post('/bonus', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['wallet'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string', enum: ['BONES', 'YARN'] },
          description: { type: 'string' },
        },
        required: ['userId', 'amount', 'currency', 'description'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const adminUserId = (request as any).user.userId;
      const { userId, amount, currency, description } = request.body as any;

      // Проверяем, является ли пользователь администратором
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { userId: adminUserId },
      });

      if (!adminProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав для начисления бонусов',
        });
      }

      // Проверяем, существует ли получатель
      const recipient = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!recipient) {
        return reply.status(404).send({
          success: false,
          message: 'Получатель не найден',
        });
      }

      // Создаем транзакцию бонуса
      await prisma.transaction.create({
        data: {
          userId,
          type: 'BONUS',
          currency,
          amount,
          description: `Бонус: ${description}`,
        },
      });

      return reply.send({
        success: true,
        message: 'Бонус начислен успешно',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при начислении бонуса',
      });
    }
  });
}

