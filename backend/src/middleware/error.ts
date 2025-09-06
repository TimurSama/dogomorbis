import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';

export async function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  // Логируем ошибку
  request.log.error(error);

  // Обработка ошибок Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(400).send({
          success: false,
          message: 'Нарушение уникальности: запись с такими данными уже существует',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        });
      
      case 'P2025':
        return reply.status(404).send({
          success: false,
          message: 'Запись не найдена',
          code: 'RECORD_NOT_FOUND',
        });
      
      case 'P2003':
        return reply.status(400).send({
          success: false,
          message: 'Нарушение внешнего ключа',
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
        });
      
      default:
        return reply.status(500).send({
          success: false,
          message: 'Ошибка базы данных',
          code: 'DATABASE_ERROR',
        });
    }
  }

  // Обработка ошибок валидации
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      message: 'Ошибка валидации данных',
      code: 'VALIDATION_ERROR',
      details: error.validation,
    });
  }

  // Обработка ошибок JWT
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      success: false,
      message: 'Недействительный токен',
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      success: false,
      message: 'Токен истек',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Обработка ошибок файлов
  if (error.code === 'LIMIT_FILE_SIZE') {
    return reply.status(413).send({
      success: false,
      message: 'Файл слишком большой',
      code: 'FILE_TOO_LARGE',
    });
  }

  // Обработка ошибок rate limiting
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      message: 'Слишком много запросов. Попробуйте позже',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // Обработка ошибок CORS
  if (error.message?.includes('CORS')) {
    return reply.status(403).send({
      success: false,
      message: 'CORS ошибка',
      code: 'CORS_ERROR',
    });
  }

  // Обработка ошибок 404
  if (error.statusCode === 404) {
    return reply.status(404).send({
      success: false,
      message: 'Ресурс не найден',
      code: 'NOT_FOUND',
    });
  }

  // Обработка ошибок 403
  if (error.statusCode === 403) {
    return reply.status(403).send({
      success: false,
      message: 'Доступ запрещен',
      code: 'FORBIDDEN',
    });
  }

  // Обработка ошибок 401
  if (error.statusCode === 401) {
    return reply.status(401).send({
      success: false,
      message: 'Требуется аутентификация',
      code: 'UNAUTHORIZED',
    });
  }

  // Обработка ошибок 400
  if (error.statusCode === 400) {
    return reply.status(400).send({
      success: false,
      message: error.message || 'Неверный запрос',
      code: 'BAD_REQUEST',
    });
  }

  // Обработка ошибок 500
  if (error.statusCode === 500) {
    return reply.status(500).send({
      success: false,
      message: 'Внутренняя ошибка сервера',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  // Обработка всех остальных ошибок
  return reply.status(500).send({
    success: false,
    message: 'Произошла непредвиденная ошибка',
    code: 'UNKNOWN_ERROR',
  });
}