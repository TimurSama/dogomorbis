import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const aiQuestionSchema = z.object({
  question: z.string().min(1).max(1000),
  dogId: z.string().optional(),
  context: z.record(z.any()).optional(),
});

const aiRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

export default async function aiRoutes(fastify: FastifyInstance) {
  // Задать вопрос AI-помощнику
  fastify.post('/ask', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['ai'],
      security: [{ Bearer: [] }],
      body: aiQuestionSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = aiQuestionSchema.parse(request.body);

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

      // Получаем контекст пользователя и собаки
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dogOwnerships: {
            where: { isActive: true },
            include: {
              dog: {
                include: {
                  photos: true,
                },
              },
            },
          },
          journalEntries: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      let dogContext = null;
      if (data.dogId) {
        dogContext = await prisma.dog.findUnique({
          where: { id: data.dogId },
          include: {
            photos: true,
            journalEntries: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
            healthRecords: {
              take: 5,
              orderBy: { date: 'desc' },
            },
          },
        });
      }

      // Формируем контекст для AI
      const context = {
        user: {
          psychotype: user?.psychotype,
          experience: user?.journalEntries.length || 0,
        },
        dog: dogContext ? {
          name: dogContext.name,
          breed: dogContext.breed,
          age: dogContext.dateOfBirth ? 
            Math.floor((Date.now() - dogContext.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          temperament: dogContext.temperament,
          energyLevel: dogContext.energyLevel,
          recentEntries: dogContext.journalEntries.slice(0, 3),
          recentHealth: dogContext.healthRecords.slice(0, 3),
        } : null,
        question: data.question,
        additionalContext: data.context,
      };

      // В реальном приложении здесь будет вызов OpenAI API
      // Пока возвращаем примерный ответ
      const aiResponse = generateAIResponse(context);

      // Сохраняем взаимодействие
      const interaction = await prisma.aiInteraction.create({
        data: {
          userId,
          dogId: data.dogId,
          type: 'QUESTION',
          prompt: data.question,
          response: aiResponse,
          context: JSON.stringify(context),
        },
      });

      return reply.send({
        success: true,
        response: aiResponse,
        interactionId: interaction.id,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обработке вопроса AI',
      });
    }
  });

  // Получение истории взаимодействий с AI
  fastify.get('/history', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['ai'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId, limit = 20, offset = 0 } = request.query as any;

      const where: any = { userId };

      if (dogId) {
        where.dogId = dogId;
      }

      const interactions = await prisma.aiInteraction.findMany({
        where,
        include: {
          dog: {
            select: {
              id: true,
              name: true,
              breed: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        interactions: interactions.map(interaction => ({
          ...interaction,
          context: interaction.context ? JSON.parse(interaction.context) : null,
        })),
        pagination: {
          limit,
          offset,
          total: interactions.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении истории AI',
      });
    }
  });

  // Оценка ответа AI
  fastify.post('/rate/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['ai'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: aiRatingSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = aiRatingSchema.parse(request.body);

      // Проверяем, принадлежит ли взаимодействие пользователю
      const interaction = await prisma.aiInteraction.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!interaction) {
        return reply.status(404).send({
          success: false,
          message: 'Взаимодействие не найдено',
        });
      }

      // Обновляем оценку
      await prisma.aiInteraction.update({
        where: { id },
        data: {
          rating: data.rating,
        },
      });

      return reply.send({
        success: true,
        message: 'Оценка сохранена',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при сохранении оценки',
      });
    }
  });

  // Получение рекомендаций
  fastify.get('/recommendations', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['ai'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
          type: { type: 'string', enum: ['health', 'training', 'nutrition', 'activity'] },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId, type } = request.query as any;

      // Проверяем права на собаку
      if (dogId) {
        const ownership = await prisma.dogOwnership.findFirst({
          where: {
            dogId,
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

      // Получаем данные для анализа
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          dogOwnerships: {
            where: { isActive: true },
            include: {
              dog: {
                include: {
                  photos: true,
                  journalEntries: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                  },
                  healthRecords: {
                    take: 10,
                    orderBy: { date: 'desc' },
                  },
                },
              },
            },
          },
        },
      });

      // Генерируем рекомендации на основе данных
      const recommendations = generateRecommendations(user, dogId, type);

      return reply.send({
        success: true,
        recommendations,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении рекомендаций',
      });
    }
  });

  // Анализ здоровья собаки
  fastify.get('/health-analysis/:dogId', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['ai'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          dogId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { dogId } = request.params as { dogId: string };

      // Проверяем права на собаку
      const ownership = await prisma.dogOwnership.findFirst({
        where: {
          dogId,
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

      // Получаем данные о собаке
      const dog = await prisma.dog.findUnique({
        where: { id: dogId },
        include: {
          journalEntries: {
            orderBy: { createdAt: 'desc' },
          },
          healthRecords: {
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!dog) {
        return reply.status(404).send({
          success: false,
          message: 'Собака не найдена',
        });
      }

      // Анализируем данные
      const analysis = analyzeDogHealth(dog);

      return reply.send({
        success: true,
        analysis,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при анализе здоровья',
      });
    }
  });
}

// Вспомогательные функции

function generateAIResponse(context: any): string {
  // В реальном приложении здесь будет вызов OpenAI API
  // Пока возвращаем примерные ответы на основе контекста
  
  const { question, dog, user } = context;
  
  if (question.toLowerCase().includes('питание') || question.toLowerCase().includes('корм')) {
    return `Для собаки породы ${dog?.breed || 'вашей породы'} рекомендую сбалансированный рацион с высококачественным белком. Учитывая возраст ${dog?.age || 'вашей собаки'} лет, важно следить за калорийностью. Рекомендую консультироваться с ветеринаром для составления индивидуального рациона.`;
  }
  
  if (question.toLowerCase().includes('тренировка') || question.toLowerCase().includes('дрессировка')) {
    return `Для тренировки собаки с темпераментом ${dog?.temperament || 'вашего типа'} рекомендую использовать позитивное подкрепление. Начните с базовых команд и постепенно усложняйте задачи. Учитывайте уровень энергии ${dog?.energyLevel || 'вашей собаки'} при планировании тренировок.`;
  }
  
  if (question.toLowerCase().includes('здоровье') || question.toLowerCase().includes('болезнь')) {
    return `Для поддержания здоровья собаки важно регулярно посещать ветеринара, следить за весом и активностью. Если у вас есть конкретные симптомы, рекомендую немедленно обратиться к специалисту. Профилактика всегда лучше лечения.`;
  }
  
  return `Спасибо за ваш вопрос! Я готов помочь с любыми вопросами о здоровье, питании, тренировках и уходе за вашей собакой. Можете задать более конкретный вопрос, и я дам подробный ответ.`;
}

function generateRecommendations(user: any, dogId: string | null, type: string | null): any[] {
  const recommendations = [];
  
  if (type === 'health' || !type) {
    recommendations.push({
      type: 'health',
      title: 'Регулярные осмотры',
      description: 'Рекомендую посещать ветеринара каждые 6 месяцев для профилактического осмотра',
      priority: 'high',
    });
  }
  
  if (type === 'training' || !type) {
    recommendations.push({
      type: 'training',
      title: 'Базовые команды',
      description: 'Начните с обучения основным командам: сидеть, лежать, ко мне',
      priority: 'medium',
    });
  }
  
  if (type === 'nutrition' || !type) {
    recommendations.push({
      type: 'nutrition',
      title: 'Сбалансированное питание',
      description: 'Обеспечьте собаку качественным кормом с достаточным количеством белка',
      priority: 'high',
    });
  }
  
  if (type === 'activity' || !type) {
    recommendations.push({
      type: 'activity',
      title: 'Регулярные прогулки',
      description: 'Обеспечьте собаке достаточную физическую активность каждый день',
      priority: 'high',
    });
  }
  
  return recommendations;
}

function analyzeDogHealth(dog: any): any {
  const analysis = {
    overallHealth: 'good',
    recommendations: [],
    concerns: [],
    trends: {},
  };
  
  // Анализ записей в журнале
  const recentEntries = dog.journalEntries.slice(0, 10);
  const moodCounts = {};
  
  recentEntries.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });
  
  // Анализ настроения
  if (moodCounts['SAD'] > moodCounts['HAPPY']) {
    analysis.concerns.push('Собака часто грустит - возможно, стоит обратиться к ветеринару');
  }
  
  // Анализ активности
  const activityCounts = {};
  recentEntries.forEach(entry => {
    activityCounts[entry.activity] = (activityCounts[entry.activity] || 0) + 1;
  });
  
  if (activityCounts['REST'] > activityCounts['WALK']) {
    analysis.recommendations.push('Увеличьте количество прогулок для поддержания активности');
  }
  
  // Анализ медицинских записей
  const recentHealth = dog.healthRecords.slice(0, 5);
  if (recentHealth.length === 0) {
    analysis.recommendations.push('Рекомендую запланировать визит к ветеринару для профилактического осмотра');
  }
  
  return analysis;
}

