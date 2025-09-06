import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import staticPlugin from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Импортируем роуты
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import dogRoutes from './routes/dogs';
import matchRoutes from './routes/matches';
import mapRoutes from './routes/map';
import feedRoutes from './routes/feed';
import journalRoutes from './routes/journal';
import walletRoutes from './routes/wallet';
import daoRoutes from './routes/dao';
import partnerRoutes from './routes/partners';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';

// Импортируем middleware
import { authenticate } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { logger } from './utils/logger';

// Импортируем WebSocket сервер
import { setupWebSocket } from './websocket';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Регистрируем плагины
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
  });

  // Multipart для загрузки файлов
  await fastify.register(multipart, {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    },
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  });

  // Swagger документация
  if (process.env.ENABLE_SWAGGER === 'true') {
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'Dogymorbis API',
          description: 'API для мобильного приложения Dogymorbis',
          version: '0.21.0',
        },
        host: `${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'auth', description: 'Аутентификация' },
          { name: 'users', description: 'Пользователи' },
          { name: 'dogs', description: 'Собаки' },
          { name: 'matches', description: 'Совпадения' },
          { name: 'map', description: 'Карта' },
          { name: 'feed', description: 'Лента' },
          { name: 'journal', description: 'Дневник' },
          { name: 'wallet', description: 'Кошелёк' },
          { name: 'dao', description: 'DAO' },
          { name: 'partners', description: 'Партнёры' },
          { name: 'admin', description: 'Админ' },
          { name: 'ai', description: 'AI Assistant' },
        ],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
          },
        },
      },
    });

    await fastify.register(swaggerUi, {
      routePrefix: '/api/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });
  }

  // Статические файлы
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, '../uploads'),
    prefix: '/uploads/',
  });
}

// Регистрируем роуты
async function registerRoutes() {
  // Публичные роуты
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(aiRoutes, { prefix: '/api/ai' });

  // Защищенные роуты
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(dogRoutes, { prefix: '/api/dogs' });
  await fastify.register(matchRoutes, { prefix: '/api/matches' });
  await fastify.register(mapRoutes, { prefix: '/api/map' });
  await fastify.register(feedRoutes, { prefix: '/api/feed' });
  await fastify.register(journalRoutes, { prefix: '/api/journal' });
  await fastify.register(walletRoutes, { prefix: '/api/wallet' });
  await fastify.register(daoRoutes, { prefix: '/api/dao' });
  await fastify.register(partnerRoutes, { prefix: '/api/partners' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });
}

// Регистрируем middleware
async function registerMiddleware() {
  // Глобальный обработчик ошибок
  fastify.setErrorHandler(errorHandler);

  // Middleware для логирования запросов
  fastify.addHook('onRequest', async (request, reply) => {
    logger.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });
  });

  // Middleware для аутентификации (для защищенных роутов)
  fastify.addHook('preHandler', async (request, reply) => {
    const routeConfig = request.routeConfig;
    if (routeConfig?.auth === true) {
      await authenticate(request, reply);
    }
  });

  // Добавляем метод authenticate в fastify
  fastify.decorate('authenticate', authenticate);
}

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.21.0',
    environment: process.env.NODE_ENV || 'development',
  };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: '🐕 Dogymorbis API v0.21.0',
    documentation: '/api/docs',
    health: '/health',
  };
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await fastify.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запуск сервера
async function start() {
  try {
    // Регистрируем плагины и роуты
    await registerPlugins();
    await registerMiddleware();
    await registerRoutes();

    // Настраиваем WebSocket
    await setupWebSocket(fastify);

    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    logger.info(`🚀 Dogymorbis API server running on http://${host}:${port}`);
    logger.info(`📚 API Documentation: http://${host}:${port}/api/docs`);
    logger.info(`🏥 Health Check: http://${host}:${port}/health`);

  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

// Запускаем сервер только если файл запущен напрямую
if (require.main === module) {
  start();
}

export default fastify; 