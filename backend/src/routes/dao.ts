import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createProposalSchema = z.object({
  type: z.enum(['FEATURE', 'EVENT', 'PARTNERSHIP', 'CHARITY', 'INFRASTRUCTURE', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  budget: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minStake: z.number().positive().optional(),
});

const voteSchema = z.object({
  voteType: z.enum(['YES', 'NO', 'ABSTAIN']),
  stakeAmount: z.number().positive().optional(),
  reason: z.string().optional(),
});

const stakeSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['VOTING', 'REWARD', 'PENALTY']),
});

export default async function daoRoutes(fastify: FastifyInstance) {
  // Создание предложения
  fastify.post('/proposals', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
      body: createProposalSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createProposalSchema.parse(request.body);

      // Проверяем, есть ли у пользователя достаточно клубков для создания предложения
      const userTransactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let yarnBalance = 0;
      userTransactions.forEach(transaction => {
        if (transaction.currency === 'YARN') {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            yarnBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            yarnBalance -= transaction.amount;
          }
        }
      });

      const minStakeRequired = data.minStake || 100;
      if (yarnBalance < minStakeRequired) {
        return reply.status(400).send({
          success: false,
          message: `Недостаточно клубков. Требуется минимум ${minStakeRequired}`,
        });
      }

      // Создаем предложение
      const proposal = await prisma.daoProposal.create({
        data: {
          userId,
          type: data.type,
          title: data.title,
          description: data.description,
          budget: data.budget,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней по умолчанию
          minStake: data.minStake || 100,
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
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      // Создаем стейк для автора предложения
      await prisma.daoStake.create({
        data: {
          userId,
          type: 'VOTING',
          amount: minStakeRequired,
        },
      });

      // Списываем клубки
      await prisma.transaction.create({
        data: {
          userId,
          type: 'SPEND',
          currency: 'YARN',
          amount: minStakeRequired,
          description: `Стейк для предложения: ${data.title}`,
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Предложение создано',
        proposal,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании предложения',
      });
    }
  });

  // Получение предложений
  fastify.get('/proposals', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          type: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { status, type, limit = 20, offset = 0 } = request.query as any;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      const proposals = await prisma.daoProposal.findMany({
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
          votes: {
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
          _count: {
            select: {
              votes: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        proposals,
        pagination: {
          limit,
          offset,
          total: proposals.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении предложений',
      });
    }
  });

  // Получение конкретного предложения
  fastify.get('/proposals/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
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
      const { id } = request.params as { id: string };

      const proposal = await prisma.daoProposal.findUnique({
        where: { id },
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
          votes: {
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
      });

      if (!proposal) {
        return reply.status(404).send({
          success: false,
          message: 'Предложение не найдено',
        });
      }

      // Подсчитываем голоса
      const voteStats = {
        yes: proposal.votes.filter(v => v.voteType === 'YES').length,
        no: proposal.votes.filter(v => v.voteType === 'NO').length,
        abstain: proposal.votes.filter(v => v.voteType === 'ABSTAIN').length,
      };

      return reply.send({
        success: true,
        proposal: {
          ...proposal,
          voteStats,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении предложения',
      });
    }
  });

  // Голосование за предложение
  fastify.post('/proposals/:id/vote', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: voteSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = voteSchema.parse(request.body);

      // Проверяем, существует ли предложение
      const proposal = await prisma.daoProposal.findUnique({
        where: { id },
      });

      if (!proposal) {
        return reply.status(404).send({
          success: false,
          message: 'Предложение не найдено',
        });
      }

      // Проверяем, не истек ли срок голосования
      if (new Date() > proposal.endDate) {
        return reply.status(400).send({
          success: false,
          message: 'Срок голосования истек',
        });
      }

      // Проверяем, не голосовал ли уже пользователь
      const existingVote = await prisma.daoVote.findUnique({
        where: {
          userId_proposalId: {
            userId,
            proposalId: id,
          },
        },
      });

      if (existingVote) {
        return reply.status(400).send({
          success: false,
          message: 'Вы уже голосовали за это предложение',
        });
      }

      // Проверяем баланс клубков
      const userTransactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let yarnBalance = 0;
      userTransactions.forEach(transaction => {
        if (transaction.currency === 'YARN') {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            yarnBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            yarnBalance -= transaction.amount;
          }
        }
      });

      const stakeAmount = data.stakeAmount || 10;
      if (yarnBalance < stakeAmount) {
        return reply.status(400).send({
          success: false,
          message: 'Недостаточно клубков для голосования',
        });
      }

      // Создаем голос
      await prisma.daoVote.create({
        data: {
          userId,
          proposalId: id,
          voteType: data.voteType,
          stakeAmount,
          reason: data.reason,
        },
      });

      // Создаем стейк
      await prisma.daoStake.create({
        data: {
          userId,
          type: 'VOTING',
          amount: stakeAmount,
        },
      });

      // Списываем клубки
      await prisma.transaction.create({
        data: {
          userId,
          type: 'SPEND',
          currency: 'YARN',
          amount: stakeAmount,
          description: `Голосование за предложение: ${proposal.title}`,
        },
      });

      return reply.send({
        success: true,
        message: 'Голос засчитан',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при голосовании',
      });
    }
  });

  // Создание стейка
  fastify.post('/stakes', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
      body: stakeSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = stakeSchema.parse(request.body);

      // Проверяем баланс клубков
      const userTransactions = await prisma.transaction.findMany({
        where: { userId },
      });

      let yarnBalance = 0;
      userTransactions.forEach(transaction => {
        if (transaction.currency === 'YARN') {
          if (transaction.type === 'EARN' || transaction.type === 'BONUS' || transaction.type === 'REFUND') {
            yarnBalance += transaction.amount;
          } else if (transaction.type === 'SPEND' || transaction.type === 'BURN' || transaction.type === 'TRANSFER') {
            yarnBalance -= transaction.amount;
          }
        }
      });

      if (yarnBalance < data.amount) {
        return reply.status(400).send({
          success: false,
          message: 'Недостаточно клубков для стейка',
        });
      }

      // Создаем стейк
      const stake = await prisma.daoStake.create({
        data: {
          userId,
          type: data.type,
          amount: data.amount,
        },
      });

      // Списываем клубки
      await prisma.transaction.create({
        data: {
          userId,
          type: 'SPEND',
          currency: 'YARN',
          amount: data.amount,
          description: `Стейк: ${data.type}`,
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Стейк создан',
        stake,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании стейка',
      });
    }
  });

  // Получение стейков пользователя
  fastify.get('/stakes', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const stakes = await prisma.daoStake.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        stakes,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении стейков',
      });
    }
  });

  // Получение статистики DAO
  fastify.get('/stats', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dao'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Статистика предложений пользователя
      const userProposals = await prisma.daoProposal.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              votes: true,
            },
          },
        },
      });

      // Статистика голосов пользователя
      const userVotes = await prisma.daoVote.findMany({
        where: { userId },
      });

      // Общая статистика DAO
      const totalProposals = await prisma.daoProposal.count();
      const totalVotes = await prisma.daoVote.count();
      const totalStakes = await prisma.daoStake.count();

      const activeProposals = await prisma.daoProposal.count({
        where: {
          endDate: { gt: new Date() },
        },
      });

      return reply.send({
        success: true,
        stats: {
          user: {
            proposals: userProposals.length,
            votes: userVotes.length,
            proposalsWithVotes: userProposals.reduce((sum, p) => sum + p._count.votes, 0),
          },
          global: {
            totalProposals,
            activeProposals,
            totalVotes,
            totalStakes,
          },
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении статистики DAO',
      });
    }
  });
}

