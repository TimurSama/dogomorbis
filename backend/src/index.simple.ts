import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { setupWebSocket } from './websocket';

// Загружаем переменные окружения
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
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

// Placeholder images
fastify.get('/api/placeholder/:width/:height', async (request, reply) => {
  const { width, height } = request.params as { width: string; height: string };
  const w = parseInt(width) || 200;
  const h = parseInt(height) || 200;
  
  // Создаем простой SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#999">
        ${w}×${h}
      </text>
    </svg>
  `;
  
  reply.type('image/svg+xml');
  return reply.send(svg);
});

// Простой тестовый endpoint
fastify.get('/api/test', async (request, reply) => {
  return {
    message: 'API работает!',
    timestamp: new Date().toISOString(),
  };
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    fastify.log.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Запуск сервера
async function start() {
  try {
    // Регистрируем плагины
    await registerPlugins();

    // Настраиваем WebSocket
    await setupWebSocket(fastify);

    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    fastify.log.info(`🚀 Dogymorbis API server running on http://${host}:${port}`);
    fastify.log.info(`🏥 Health Check: http://${host}:${port}/health`);
    fastify.log.info(`🧪 Test endpoint: http://${host}:${port}/api/test`);

  } catch (error) {
    fastify.log.error('Error starting server:', error);
    process.exit(1);
  }
}

// Запускаем сервер только если файл запущен напрямую
if (require.main === module) {
  start();
}

export default fastify;

