import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createMatchSchema = z.object({
  userId2: z.string(),
  dogId1: z.string().optional(),
  dogId2: z.string().optional(),
  message: z.string().optional(),
});

const updateMatchSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED']).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  scheduledAt: z.string().optional(),
  notes: z.string().optional(),
});

export default async function matchRoutes(fastify: FastifyInstance) {
  // Создание совпадения
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
      security: [{ Bearer: [] }],
      body: createMatchSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId1 = (request as any).user.userId;
      const data = createMatchSchema.parse(request.body);

      // Проверяем, существует ли пользователь
      const user2 = await prisma.user.findUnique({
        where: { id: data.userId2 },
      });

      if (!user2) {
        return reply.status(404).send({
          success: false,
          message: 'Пользователь не найден',
        });
      }

      if (userId1 === data.userId2) {
        return reply.status(400).send({
          success: false,
          message: 'Нельзя создать совпадение с самим собой',
        });
      }

      // Проверяем, не существует ли уже совпадение
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { userId1, userId2: data.userId2 },
            { userId1: data.userId2, userId2: userId1 },
          ],
        },
      });

      if (existingMatch) {
        return reply.status(400).send({
          success: false,
          message: 'Совпадение уже существует',
        });
      }

      // Проверяем права на собак
      if (data.dogId1) {
        const ownership1 = await prisma.dogOwnership.findFirst({
          where: {
            dogId: data.dogId1,
            userId: userId1,
            isActive: true,
          },
        });

        if (!ownership1) {
          return reply.status(403).send({
            success: false,
            message: 'У вас нет прав на эту собаку',
          });
        }
      }

      if (data.dogId2) {
        const ownership2 = await prisma.dogOwnership.findFirst({
          where: {
            dogId: data.dogId2,
            userId: data.userId2,
            isActive: true,
          },
        });

        if (!ownership2) {
          return reply.status(403).send({
            success: false,
            message: 'У пользователя нет прав на эту собаку',
          });
        }
      }

      // Создаем совпадение
      const match = await prisma.match.create({
        data: {
          userId1,
          userId2: data.userId2,
          dogId1: data.dogId1,
          dogId2: data.dogId2,
          status: 'PENDING',
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          dog1: {
            include: {
              photos: true,
            },
          },
          dog2: {
            include: {
              photos: true,
            },
          },
        },
      });

      // Создаем приглашение
      await prisma.matchInvite.create({
        data: {
          fromUserId: userId1,
          toUserId: data.userId2,
          matchId: match.id,
          message: data.message,
          status: 'PENDING',
        },
      });

      // Начисляем косточки за создание совпадения
      await prisma.transaction.create({
        data: {
          userId: userId1,
          type: 'EARN',
          currency: 'BONES',
          amount: 10,
          description: 'Создание совпадения',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Совпадение создано',
        match,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании совпадения',
      });
    }
  });

  // Получение совпадений пользователя
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { status, limit = 20, offset = 0 } = request.query as any;

      const where: any = {
        OR: [
          { userId1: userId },
          { userId2: userId },
        ],
      };

      if (status) {
        where.status = status;
      }

      const matches = await prisma.match.findMany({
        where,
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          dog1: {
            include: {
              photos: true,
            },
          },
          dog2: {
            include: {
              photos: true,
            },
          },
          invites: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
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
        matches: matches.map(match => ({
          ...match,
          location: match.location ? JSON.parse(match.location) : null,
        })),
        pagination: {
          limit,
          offset,
          total: matches.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении совпадений',
      });
    }
  });

  // Получение конкретного совпадения
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
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

      const match = await prisma.match.findFirst({
        where: {
          id,
          OR: [
            { userId1: userId },
            { userId2: userId },
          ],
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          dog1: {
            include: {
              photos: true,
            },
          },
          dog2: {
            include: {
              photos: true,
            },
          },
          invites: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!match) {
        return reply.status(404).send({
          success: false,
          message: 'Совпадение не найдено',
        });
      }

      return reply.send({
        success: true,
        match: {
          ...match,
          location: match.location ? JSON.parse(match.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении совпадения',
      });
    }
  });

  // Обновление совпадения
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: updateMatchSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = updateMatchSchema.parse(request.body);

      // Проверяем, является ли пользователь участником совпадения
      const match = await prisma.match.findFirst({
        where: {
          id,
          OR: [
            { userId1: userId },
            { userId2: userId },
          ],
        },
      });

      if (!match) {
        return reply.status(404).send({
          success: false,
          message: 'Совпадение не найдено или у вас нет прав на его редактирование',
        });
      }

      const updateData: any = { ...data };
      if (data.location) {
        updateData.location = JSON.stringify(data.location);
      }
      if (data.scheduledAt) {
        updateData.scheduledAt = new Date(data.scheduledAt);
      }

      const updatedMatch = await prisma.match.update({
        where: { id },
        data: updateData,
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          dog1: {
            include: {
              photos: true,
            },
          },
          dog2: {
            include: {
              photos: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Совпадение обновлено',
        match: {
          ...updatedMatch,
          location: updatedMatch.location ? JSON.parse(updatedMatch.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении совпадения',
      });
    }
  });

  // Ответ на приглашение
  fastify.post('/:id/respond', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
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
          status: { type: 'string', enum: ['ACCEPTED', 'DECLINED'] },
          message: { type: 'string' },
        },
        required: ['status'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const { status, message } = request.body as any;

      // Находим приглашение
      const invite = await prisma.matchInvite.findFirst({
        where: {
          matchId: id,
          toUserId: userId,
          status: 'PENDING',
        },
      });

      if (!invite) {
        return reply.status(404).send({
          success: false,
          message: 'Приглашение не найдено',
        });
      }

      // Обновляем приглашение
      await prisma.matchInvite.update({
        where: { id: invite.id },
        data: {
          status: status === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED',
          respondedAt: new Date(),
        },
      });

      // Если принято, обновляем статус совпадения
      if (status === 'ACCEPTED') {
        await prisma.match.update({
          where: { id },
          data: { status: 'ACTIVE' },
        });

        // Начисляем косточки обоим участникам
        await prisma.transaction.createMany({
          data: [
            {
              userId: invite.fromUserId,
              type: 'EARN',
              currency: 'BONES',
              amount: 15,
              description: 'Принятие совпадения',
            },
            {
              userId: invite.toUserId,
              type: 'EARN',
              currency: 'BONES',
              amount: 15,
              description: 'Принятие совпадения',
            },
          ],
        });
      }

      return reply.send({
        success: true,
        message: `Приглашение ${status === 'ACCEPTED' ? 'принято' : 'отклонено'}`,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при ответе на приглашение',
      });
    }
  });

  // Получение приглашений
  fastify.get('/invites', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { status, limit = 20, offset = 0 } = request.query as any;

      const where: any = {
        toUserId: userId,
      };

      if (status) {
        where.status = status;
      }

      const invites = await prisma.matchInvite.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          match: {
            include: {
              dog1: {
                include: {
                  photos: true,
                },
              },
              dog2: {
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
        invites,
        pagination: {
          limit,
          offset,
          total: invites.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении приглашений',
      });
    }
  });

  // Удаление совпадения
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['matches'],
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

      // Проверяем, является ли пользователь участником совпадения
      const match = await prisma.match.findFirst({
        where: {
          id,
          OR: [
            { userId1: userId },
            { userId2: userId },
          ],
        },
      });

      if (!match) {
        return reply.status(404).send({
          success: false,
          message: 'Совпадение не найдено или у вас нет прав на его удаление',
        });
      }

      await prisma.match.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Совпадение удалено',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении совпадения',
      });
    }
  });
}

