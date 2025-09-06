import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createDogSchema = z.object({
  name: z.string().min(1).max(50),
  breed: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  dateOfBirth: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  color: z.string().optional(),
  microchip: z.string().optional(),
  passport: z.string().optional(),
  temperament: z.array(z.enum(['FRIENDLY', 'SHY', 'AGGRESSIVE', 'PLAYFUL', 'CALM', 'ENERGETIC', 'INDEPENDENT', 'DEPENDENT'])),
  energyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  sociability: z.enum(['VERY_SOCIAL', 'SOCIAL', 'MODERATE', 'SHY', 'ANTI_SOCIAL']),
  trainability: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'VERY_DIFFICULT']),
  isNeutered: z.boolean().optional(),
  isVaccinated: z.boolean().optional(),
  medicalNotes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  isFriendly: z.boolean().optional(),
  isAggressive: z.boolean().optional(),
  isShy: z.boolean().optional(),
  specialNeeds: z.string().optional(),
});

const updateDogSchema = createDogSchema.partial();

const addPhotoSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export default async function dogRoutes(fastify: FastifyInstance) {
  // Создание профиля собаки
  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
      body: createDogSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createDogSchema.parse(request.body);

      const dog = await prisma.dog.create({
        data: {
          name: data.name,
          breed: data.breed,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          weight: data.weight,
          height: data.height,
          color: data.color,
          microchip: data.microchip,
          passport: data.passport,
          temperament: data.temperament.join(','),
          energyLevel: data.energyLevel,
          sociability: data.sociability,
          trainability: data.trainability,
          isNeutered: data.isNeutered || false,
          isVaccinated: data.isVaccinated || false,
          medicalNotes: data.medicalNotes,
          allergies: data.allergies ? JSON.stringify(data.allergies) : null,
          medications: data.medications ? JSON.stringify(data.medications) : null,
          isFriendly: data.isFriendly || true,
          isAggressive: data.isAggressive || false,
          isShy: data.isShy || false,
          specialNeeds: data.specialNeeds,
        },
      });

      // Создаем связь владельца с собакой
      await prisma.dogOwnership.create({
        data: {
          userId,
          dogId: dog.id,
          role: 'PRIMARY',
        },
      });

      // Начисляем косточки за добавление собаки
      await prisma.transaction.create({
        data: {
          userId,
          type: 'EARN',
          currency: 'BONES',
          amount: 25,
          description: 'Добавление профиля собаки',
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Профиль собаки создан',
        dog: {
          ...dog,
          temperament: dog.temperament.split(','),
          allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
          medications: dog.medications ? JSON.parse(dog.medications) : [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании профиля собаки',
      });
    }
  });

  // Получение списка собак пользователя
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const dogs = await prisma.dog.findMany({
        where: {
          owners: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
        include: {
          photos: true,
          owners: {
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
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        dogs: dogs.map(dog => ({
          ...dog,
          temperament: dog.temperament.split(','),
          allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
          medications: dog.medications ? JSON.parse(dog.medications) : [],
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении списка собак',
      });
    }
  });

  // Получение профиля конкретной собаки
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
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

      const dog = await prisma.dog.findUnique({
        where: { id },
        include: {
          photos: true,
          owners: {
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
          },
          journalEntries: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          goals: {
            where: { isCompleted: false },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!dog) {
        return reply.status(404).send({
          success: false,
          message: 'Собака не найдена',
        });
      }

      // Проверяем, является ли пользователь владельцем
      const isOwner = dog.owners.some(owner => owner.userId === userId);

      return reply.send({
        success: true,
        dog: {
          ...dog,
          temperament: dog.temperament.split(','),
          allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
          medications: dog.medications ? JSON.parse(dog.medications) : [],
          isOwner,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении профиля собаки',
      });
    }
  });

  // Обновление профиля собаки
  fastify.put('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: updateDogSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = updateDogSchema.parse(request.body);

      // Проверяем, является ли пользователь владельцем
      const ownership = await prisma.dogOwnership.findFirst({
        where: {
          dogId: id,
          userId,
          isActive: true,
        },
      });

      if (!ownership) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав для редактирования этого профиля',
        });
      }

      const updateData: any = { ...data };
      if (data.temperament) {
        updateData.temperament = data.temperament.join(',');
      }
      if (data.allergies) {
        updateData.allergies = JSON.stringify(data.allergies);
      }
      if (data.medications) {
        updateData.medications = JSON.stringify(data.medications);
      }
      if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }

      const dog = await prisma.dog.update({
        where: { id },
        data: updateData,
        include: {
          photos: true,
        },
      });

      return reply.send({
        success: true,
        message: 'Профиль собаки обновлен',
        dog: {
          ...dog,
          temperament: dog.temperament.split(','),
          allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
          medications: dog.medications ? JSON.parse(dog.medications) : [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении профиля собаки',
      });
    }
  });

  // Добавление фотографии
  fastify.post('/:id/photos', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: addPhotoSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const data = addPhotoSchema.parse(request.body);

      // Проверяем, является ли пользователь владельцем
      const ownership = await prisma.dogOwnership.findFirst({
        where: {
          dogId: id,
          userId,
          isActive: true,
        },
      });

      if (!ownership) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав для добавления фотографий',
        });
      }

      // Если это основная фотография, снимаем флаг с других
      if (data.isPrimary) {
        await prisma.dogPhoto.updateMany({
          where: { dogId: id },
          data: { isPrimary: false },
        });
      }

      const photo = await prisma.dogPhoto.create({
        data: {
          dogId: id,
          url: data.url,
          caption: data.caption,
          isPrimary: data.isPrimary || false,
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Фотография добавлена',
        photo,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при добавлении фотографии',
      });
    }
  });

  // Удаление фотографии
  fastify.delete('/:id/photos/:photoId', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          photoId: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id, photoId } = request.params as { id: string; photoId: string };

      // Проверяем, является ли пользователь владельцем
      const ownership = await prisma.dogOwnership.findFirst({
        where: {
          dogId: id,
          userId,
          isActive: true,
        },
      });

      if (!ownership) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав для удаления фотографий',
        });
      }

      await prisma.dogPhoto.delete({
        where: { id: photoId },
      });

      return reply.send({
        success: true,
        message: 'Фотография удалена',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении фотографии',
      });
    }
  });

  // Поиск собак
  fastify.get('/search', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          breed: { type: 'string' },
          gender: { type: 'string' },
          ageMin: { type: 'number' },
          ageMax: { type: 'number' },
          energyLevel: { type: 'string' },
          sociability: { type: 'string' },
          location: { type: 'string' },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { breed, gender, ageMin, ageMax, energyLevel, sociability, limit = 20, offset = 0 } = request.query as any;

      const where: any = {};

      if (breed) {
        where.breed = { contains: breed, mode: 'insensitive' };
      }

      if (gender) {
        where.gender = gender;
      }

      if (energyLevel) {
        where.energyLevel = energyLevel;
      }

      if (sociability) {
        where.sociability = sociability;
      }

      if (ageMin || ageMax) {
        const now = new Date();
        if (ageMin) {
          const maxDate = new Date(now.getFullYear() - ageMin, now.getMonth(), now.getDate());
          where.dateOfBirth = { ...where.dateOfBirth, lte: maxDate };
        }
        if (ageMax) {
          const minDate = new Date(now.getFullYear() - ageMax, now.getMonth(), now.getDate());
          where.dateOfBirth = { ...where.dateOfBirth, gte: minDate };
        }
      }

      const dogs = await prisma.dog.findMany({
        where,
        include: {
          photos: true,
          owners: {
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
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        dogs: dogs.map(dog => ({
          ...dog,
          temperament: dog.temperament.split(','),
          allergies: dog.allergies ? JSON.parse(dog.allergies) : [],
          medications: dog.medications ? JSON.parse(dog.medications) : [],
        })),
        pagination: {
          limit,
          offset,
          total: dogs.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при поиске собак',
      });
    }
  });

  // Удаление профиля собаки
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['dogs'],
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

      // Проверяем, является ли пользователь основным владельцем
      const ownership = await prisma.dogOwnership.findFirst({
        where: {
          dogId: id,
          userId,
          role: 'PRIMARY',
          isActive: true,
        },
      });

      if (!ownership) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет прав для удаления этого профиля',
        });
      }

      await prisma.dog.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Профиль собаки удален',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при удалении профиля собаки',
      });
    }
  });
}

