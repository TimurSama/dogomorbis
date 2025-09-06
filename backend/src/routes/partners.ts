import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Схемы валидации
const createPartnerProfileSchema = z.object({
  category: z.enum(['VET', 'GROOMER', 'TRAINER', 'PET_STORE', 'DOG_WALKER', 'DOG_SITTER', 'BREEDER', 'RESCUE', 'OTHER']),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  contact: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    workingHours: z.string().optional(),
  }).optional(),
});

const createServiceSchema = z.object({
  category: z.enum(['WALKING', 'GROOMING', 'TRAINING', 'VET', 'SITTING', 'BOARDING', 'OTHER']),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  duration: z.number().positive().default(60),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  images: z.array(z.string().url()).optional(),
});

const createBookingSchema = z.object({
  serviceId: z.string(),
  dogId: z.string().optional(),
  scheduledAt: z.string(),
  duration: z.number().positive().default(60),
  notes: z.string().optional(),
});

export default async function partnerRoutes(fastify: FastifyInstance) {
  // Создание профиля партнера
  fastify.post('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
      body: createPartnerProfileSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createPartnerProfileSchema.parse(request.body);

      // Проверяем, не существует ли уже профиль партнера
      const existingProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        return reply.status(400).send({
          success: false,
          message: 'Профиль партнера уже существует',
        });
      }

      const profile = await prisma.partnerProfile.create({
        data: {
          userId,
          category: data.category,
          name: data.name,
          description: data.description,
          website: data.website,
          logo: data.logo,
          location: data.location ? JSON.stringify(data.location) : null,
          contact: data.contact ? JSON.stringify(data.contact) : null,
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

      return reply.status(201).send({
        success: true,
        message: 'Профиль партнера создан',
        profile: {
          ...profile,
          location: profile.location ? JSON.parse(profile.location) : null,
          contact: profile.contact ? JSON.parse(profile.contact) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании профиля партнера',
      });
    }
  });

  // Получение профиля партнера
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      const profile = await prisma.partnerProfile.findUnique({
        where: { userId },
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
          services: true,
          adoptionListings: {
            include: {
              dog: {
                include: {
                  photos: true,
                },
              },
            },
          },
        },
      });

      if (!profile) {
        return reply.status(404).send({
          success: false,
          message: 'Профиль партнера не найден',
        });
      }

      return reply.send({
        success: true,
        profile: {
          ...profile,
          location: profile.location ? JSON.parse(profile.location) : null,
          contact: profile.contact ? JSON.parse(profile.contact) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении профиля партнера',
      });
    }
  });

  // Обновление профиля партнера
  fastify.put('/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
      body: createPartnerProfileSchema.partial(),
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createPartnerProfileSchema.partial().parse(request.body);

      const updateData: any = { ...data };
      if (data.location) {
        updateData.location = JSON.stringify(data.location);
      }
      if (data.contact) {
        updateData.contact = JSON.stringify(data.contact);
      }

      const profile = await prisma.partnerProfile.update({
        where: { userId },
        data: updateData,
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

      return reply.send({
        success: true,
        message: 'Профиль партнера обновлен',
        profile: {
          ...profile,
          location: profile.location ? JSON.parse(profile.location) : null,
          contact: profile.contact ? JSON.parse(profile.contact) : null,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении профиля партнера',
      });
    }
  });

  // Создание услуги
  fastify.post('/services', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
      body: createServiceSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createServiceSchema.parse(request.body);

      // Проверяем, является ли пользователь партнером
      const partnerProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });

      if (!partnerProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет профиля партнера',
        });
      }

      const service = await prisma.service.create({
        data: {
          partnerId: partnerProfile.id,
          category: data.category,
          title: data.title,
          description: data.description,
          price: data.price,
          duration: data.duration,
          location: data.location ? JSON.stringify(data.location) : null,
          images: data.images ? JSON.stringify(data.images) : null,
        },
        include: {
          partner: {
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
      });

      return reply.status(201).send({
        success: true,
        message: 'Услуга создана',
        service: {
          ...service,
          location: service.location ? JSON.parse(service.location) : null,
          images: service.images ? JSON.parse(service.images) : [],
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при создании услуги',
      });
    }
  });

  // Получение услуг партнера
  fastify.get('/services', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;

      // Проверяем, является ли пользователь партнером
      const partnerProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });

      if (!partnerProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет профиля партнера',
        });
      }

      const services = await prisma.service.findMany({
        where: { partnerId: partnerProfile.id },
        include: {
          bookings: {
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({
        success: true,
        services: services.map(service => ({
          ...service,
          location: service.location ? JSON.parse(service.location) : null,
          images: service.images ? JSON.parse(service.images) : [],
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении услуг',
      });
    }
  });

  // Поиск партнеров
  fastify.get('/search', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 5000 },
          limit: { type: 'number', default: 20 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { category, lat, lng, radius = 5000, limit = 20, offset = 0 } = request.query as any;

      const where: any = {
        isActive: true,
        isVerified: true,
      };

      if (category) {
        where.category = category;
      }

      const partners = await prisma.partnerProfile.findMany({
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
          services: {
            where: { isActive: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      // Фильтруем по расстоянию, если указаны координаты
      let filteredPartners = partners;
      if (lat && lng) {
        filteredPartners = partners.filter(partner => {
          if (!partner.location) return false;
          
          const partnerLocation = JSON.parse(partner.location);
          const distance = calculateDistance(lat, lng, partnerLocation.lat, partnerLocation.lng);
          
          return distance <= radius;
        });
      }

      return reply.send({
        success: true,
        partners: filteredPartners.map(partner => ({
          ...partner,
          location: partner.location ? JSON.parse(partner.location) : null,
          contact: partner.contact ? JSON.parse(partner.contact) : null,
        })),
        pagination: {
          limit,
          offset,
          total: filteredPartners.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при поиске партнеров',
      });
    }
  });

  // Бронирование услуги
  fastify.post('/bookings', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
      security: [{ Bearer: [] }],
      body: createBookingSchema,
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const data = createBookingSchema.parse(request.body);

      // Проверяем, существует ли услуга
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId },
        include: {
          partner: true,
        },
      });

      if (!service) {
        return reply.status(404).send({
          success: false,
          message: 'Услуга не найдена',
        });
      }

      if (!service.isActive) {
        return reply.status(400).send({
          success: false,
          message: 'Услуга недоступна',
        });
      }

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

      const booking = await prisma.booking.create({
        data: {
          userId,
          serviceId: data.serviceId,
          dogId: data.dogId,
          scheduledAt: new Date(data.scheduledAt),
          duration: data.duration,
          notes: data.notes,
          totalPrice: service.price,
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
          service: {
            include: {
              partner: {
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
          },
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        message: 'Услуга забронирована',
        booking,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при бронировании услуги',
      });
    }
  });

  // Получение бронирований партнера
  fastify.get('/bookings', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
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

      // Проверяем, является ли пользователь партнером
      const partnerProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });

      if (!partnerProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет профиля партнера',
        });
      }

      const where: any = {
        service: {
          partnerId: partnerProfile.id,
        },
      };

      if (status) {
        where.status = status;
      }

      const bookings = await prisma.booking.findMany({
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
          service: true,
          dog: {
            include: {
              photos: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { scheduledAt: 'desc' },
      });

      return reply.send({
        success: true,
        bookings,
        pagination: {
          limit,
          offset,
          total: bookings.length,
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при получении бронирований',
      });
    }
  });

  // Обновление статуса бронирования
  fastify.put('/bookings/:id/status', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['partners'],
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
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
        },
        required: ['status'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      const { id } = request.params as { id: string };
      const { status } = request.body as any;

      // Проверяем, является ли пользователь партнером
      const partnerProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });

      if (!partnerProfile) {
        return reply.status(403).send({
          success: false,
          message: 'У вас нет профиля партнера',
        });
      }

      // Проверяем, принадлежит ли бронирование партнеру
      const booking = await prisma.booking.findFirst({
        where: {
          id,
          service: {
            partnerId: partnerProfile.id,
          },
        },
      });

      if (!booking) {
        return reply.status(404).send({
          success: false,
          message: 'Бронирование не найдено',
        });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status },
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
          service: true,
          dog: {
            include: {
              photos: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        message: 'Статус бронирования обновлен',
        booking: updatedBooking,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Ошибка при обновлении статуса бронирования',
      });
    }
  });
}

// Вспомогательная функция для расчета расстояния
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Радиус Земли в метрах
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Расстояние в метрах
}

