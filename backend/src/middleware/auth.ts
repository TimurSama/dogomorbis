import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'Токен доступа не предоставлен',
      });
    }

    // Проверяем токен в базе данных
    const session = await prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: 'Недействительный или истекший токен',
      });
    }

    if (!session.user.isActive) {
      return reply.status(401).send({
        success: false,
        message: 'Аккаунт деактивирован',
      });
    }

    // Добавляем информацию о пользователе в запрос
    (request as any).user = {
      userId: session.user.id,
      email: session.user.email,
      username: session.user.username,
    };

    // Обновляем время последней активности
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActiveAt: new Date() },
    });

  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Ошибка аутентификации',
    });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request as any).user?.userId;
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Требуется аутентификация',
      });
    }

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { userId },
    });

    if (!adminProfile || !adminProfile.isActive) {
      return reply.status(403).send({
        success: false,
        message: 'Требуются права администратора',
      });
    }

    (request as any).admin = adminProfile;

  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Ошибка проверки прав администратора',
    });
  }
}

export async function requirePartner(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request as any).user?.userId;
    
    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: 'Требуется аутентификация',
      });
    }

    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId },
    });

    if (!partnerProfile || !partnerProfile.isActive) {
      return reply.status(403).send({
        success: false,
        message: 'Требуется профиль партнера',
      });
    }

    (request as any).partner = partnerProfile;

  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Ошибка проверки прав партнера',
    });
  }
}