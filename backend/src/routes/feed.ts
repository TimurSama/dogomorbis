import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  dogId: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  isPublic: z.boolean().default(true),
  isStory: z.boolean().default(false),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isPublic: z.boolean().optional(),
});

export default async function feedRoutes(fastify: FastifyInstance) {
  // Создание поста
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
      security: [{ Bearer: [] }],
      body: createPostSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createPostSchema.parse(request.body);

      // Проверяем, принадлежит ли собака пользователю
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
            message: 'У вас нет прав на публикацию от имени этой собаки',
          });
        }
      }

      const post = await prisma.post.create({
        data: {
          userId,
          dogId: data.dogId,
          content: data.content,
          images: data.images ? JSON.stringify(data.images) : null,
          location: data.location ? JSON.stringify(data.location) : null,
          isPublic: data.isPublic,
          isStory: data.isStory,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      // Начисляем косточки за создание поста
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 5,
          description: 'Создание поста',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Пост создан',
        post: {
          ...post,
          images: post.images ? JSON.parse(post.images) : [],
          location: post.location ? JSON.parse(post.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании поста',
      });
    }
  });

  // Получение ленты
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
          type: { type: 'string', enum: ['all', 'following', 'nearby'] },
          dogId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { limit = 20, offset = 0, type = 'all', dogId } = request.query as any;

      let where: any = {
        isPublic: true,
      };

      // Фильтр по типу ленты
      if (type === 'following') {
        // В реальном приложении здесь будет логика подписок
        // Пока показываем все публичные посты
      } else if (type === 'nearby') {
        // Получаем местоположение пользователя
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { location: true },
        });

        if (user?.location) {
          const userLocation = JSON.parse(user.location);
          // В реальном приложении здесь будет геопространственный запрос
          // Пока показываем все публичные посты
        }
      }

      // Фильтр по собаке
      if (dogId) {
        where.dogId = dogId;
      }

      const posts = await prisma.post.findMany({
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
          likes: {
            where: { userId },
            select: { id: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        posts: posts.map(post => ({
          ...post,
          images: post.images ? JSON.parse(post.images) : [],
          location: post.location ? JSON.parse(post.location) : null,
          isLiked: post.likes.length > 0,
          likes: undefined, // Убираем детали лайков из ответа
        })),
        pagination: {
          limit,
          offset,
          total: posts.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении ленты',
      });
    }
  });

  // Получение конкретного поста
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
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

      const post = await prisma.post.findUnique({
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
          dog: {
            include: {
              photos: true,
            },
          },
          comments: {
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
            orderBy: { createdAt: 'asc' },
          },
          likes: {
            where: { userId },
            select: { id: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Пост не найден',
        });
      }

      return reply.send({
        success: true,
        post: {
          ...post,
          images: post.images ? JSON.parse(post.images) : [],
          location: post.location ? JSON.parse(post.location) : null,
          isLiked: post.likes.length > 0,
          likes: undefined,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении поста',
      });
    }
  });

  // Обновление поста
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: updatePostSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = updatePostSchema.parse(request.body);

      // Проверяем, является ли пользователь автором поста
      const post = await prisma.post.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Пост не найден или у вас нет прав на его редактирование',
        });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data,
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Пост обновлен',
        post: {
          ...updatedPost,
          images: updatedPost.images ? JSON.parse(updatedPost.images) : [],
          location: updatedPost.location ? JSON.parse(updatedPost.location) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении поста',
      });
    }
  });

  // Удаление поста
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
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

      // Проверяем, является ли пользователь автором поста
      const post = await prisma.post.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Пост не найден или у вас нет прав на его удаление',
        });
      }

      await prisma.post.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Пост удален',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении поста',
      });
    }
  });

  // Лайк поста
  fastify.post('/:id/like', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
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

      // Проверяем, существует ли пост
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Пост не найден',
        });
      }

      // Проверяем, не лайкнул ли уже пользователь
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: id,
          },
        },
      });

      if (existingLike) {
        return reply.status(400).send({
          success: false,
          message: 'Вы уже лайкнули этот пост',
        });
      }

      // Создаем лайк
      await prisma.like.create({
        data: {
          userId,
          postId: id,
        },
      });

      // Начисляем косточки автору поста
      if (post.userId !== userId) {
        await prisma.transaction.create({
          data: {
            userId: post.userId,
            type: 'EARN',
            currency: 'BONES',
            amount: 1,
            description: 'Лайк поста',
          },
        });
      }

      return reply.send({
        success: true,
        message: 'Пост лайкнут',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при лайке поста',
      });
    }
  });

  // Удаление лайка
  fastify.delete('/:id/like', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
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

      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId: id,
          },
        },
      });

      if (!like) {
        return reply.status(404).send({
          success: false,
          message: 'Лайк не найден',
        });
      }

      await prisma.like.delete({
        where: { id: like.id },
      });

      return reply.send({
        success: true,
        message: 'Лайк удален',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении лайка',
      });
    }
  });

  // Создание комментария
  fastify.post('/:id/comments', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: createCommentSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = createCommentSchema.parse(request.body);

      // Проверяем, существует ли пост
      const post = await prisma.post.findUnique({
        where: { id },
      });

      if (!post) {
        return reply.status(404).send({
          success: false,
          message: 'Пост не найден',
        });
      }

      const comment = await prisma.comment.create({
        data: {
          userId,
          postId: id,
          content: data.content,
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

      // Начисляем косточки за комментарий
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 2,
          description: 'Комментарий к посту',
        },
      });

      // Начисляем косточки автору поста
      if (post.userId !== userId) {
        await prisma.transaction.create({
          data: {
            userId: post.userId,
            type: 'EARN',
            currency: 'BONES',
            amount: 1,
            description: 'Комментарий к посту',
          },
        });
      }

      return reply.status(201).send({
        success: true,
        message: 'Комментарий добавлен',
        comment,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании комментария',
      });
    }
  });

  // Получение комментариев
  fastify.get('/:id/comments', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['feed'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const { limit = 20, offset = 0 } = request.query as any;

      const comments = await prisma.comment.findMany({
        where: { postId: id },
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
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'asc' },
      });

      return reply.send({
        success: true,
        comments,
        pagination: {
          limit,
          offset,
          total: comments.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении комментариев',
      });
    }
  });
}

