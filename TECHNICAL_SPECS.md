# 🔧 Dogymorbis - Технические спецификации

## 🏗️ Архитектура системы

### Frontend (Next.js 14)
```
frontend/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── globals.css     # Глобальные стили
│   │   ├── layout.tsx      # Корневой layout
│   │   ├── page.tsx        # Главная страница
│   │   └── providers.tsx   # Провайдеры состояния
│   ├── components/         # React компоненты
│   │   ├── auth/          # Компоненты аутентификации
│   │   ├── dashboard/     # Компоненты дашборда
│   │   └── ui/            # UI компоненты
│   ├── lib/               # Утилиты и конфигурация
│   │   ├── api.ts         # API клиент
│   │   └── utils.ts       # Вспомогательные функции
│   ├── stores/            # Zustand stores
│   │   ├── auth.ts        # Состояние аутентификации
│   │   ├── map.ts         # Состояние карты
│   │   └── user.ts        # Состояние пользователя
│   └── types/             # TypeScript типы
│       └── index.ts       # Основные типы
├── tailwind.config.js     # Конфигурация Tailwind
├── next.config.js         # Конфигурация Next.js
└── package.json           # Зависимости
```

### Backend (Fastify + TypeScript)
```
backend/
├── src/
│   ├── routes/            # API роуты
│   │   ├── auth.ts        # Аутентификация
│   │   ├── users.ts       # Пользователи
│   │   ├── dogs.ts        # Собаки
│   │   ├── map.ts         # Карта и маршруты
│   │   ├── feed.ts        # Социальная лента
│   │   ├── wallet.ts      # Кошелек и геймификация
│   │   ├── dao.ts         # DAO управление
│   │   ├── partners.ts    # Партнеры и услуги
│   │   ├── admin.ts       # Административная панель
│   │   └── ai.ts          # AI-помощник
│   ├── middleware/        # Middleware
│   │   ├── auth.ts        # Аутентификация
│   │   └── error.ts       # Обработка ошибок
│   ├── utils/             # Утилиты
│   │   └── logger.ts      # Логирование
│   ├── websocket.ts       # WebSocket сервер
│   └── index.ts           # Главный файл сервера
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── migrations/        # Миграции
└── package.json           # Зависимости
```

## 🗄️ База данных (PostgreSQL + Prisma)

### Основные таблицы
```sql
-- Пользователи
users (id, email, username, password, firstName, lastName, avatar, bio, 
       phone, dateOfBirth, location, timezone, language, psychotype, 
       isVerified, isActive, isPremium, createdAt, updatedAt)

-- Собаки
dogs (id, name, breed, gender, dateOfBirth, weight, height, color, 
      microchip, passport, temperament, energyLevel, sociability, 
      trainability, isNeutered, isVaccinated, medicalNotes, 
      allergies, medications, isFriendly, isAggressive, isShy, 
      specialNeeds, createdAt, updatedAt)

-- Связи владения
dog_ownerships (id, userId, dogId, role, isActive, createdAt)

-- Посты
posts (id, userId, dogId, content, images, location, isPublic, 
       isStory, createdAt, updatedAt)

-- Совпадения
matches (id, userId1, userId2, dogId1, dogId2, status, location, 
         scheduledAt, notes, createdAt, updatedAt)

-- Транзакции (геймификация)
transactions (id, userId, type, currency, amount, description, 
              metadata, createdAt)

-- DAO предложения
dao_proposals (id, userId, type, title, description, status, 
               startDate, endDate, minStake, createdAt, updatedAt)

-- Услуги
services (id, partnerId, category, title, description, price, 
          duration, isActive, location, images, createdAt, updatedAt)

-- Бронирования
bookings (id, userId, serviceId, dogId, status, scheduledAt, 
          duration, notes, totalPrice, createdAt, updatedAt)
```

## 🔌 API Endpoints

### Аутентификация
```
POST /api/auth/register          # Регистрация
POST /api/auth/login             # Вход
POST /api/auth/refresh           # Обновление токена
POST /api/auth/forgot-password   # Забыли пароль
POST /api/auth/reset-password    # Сброс пароля
GET  /api/auth/verify            # Проверка токена
POST /api/auth/logout            # Выход
POST /api/auth/logout-all        # Выход со всех устройств
```

### Пользователи
```
GET  /api/users/profile          # Получить профиль
PUT  /api/users/profile          # Обновить профиль
POST /api/users/psychotype-test  # Тест психотипа
GET  /api/users/search           # Поиск пользователей
POST /api/users/logout           # Выход
```

### Собаки
```
POST /api/dogs                   # Создать профиль собаки
GET  /api/dogs                   # Список собак пользователя
GET  /api/dogs/:id               # Профиль собаки
PUT  /api/dogs/:id               # Обновить профиль
DELETE /api/dogs/:id             # Удалить профиль
POST /api/dogs/:id/photos        # Добавить фото
DELETE /api/dogs/:id/photos/:photoId # Удалить фото
GET  /api/dogs/search            # Поиск собак
```

### Карта и маршруты
```
POST /api/map/location           # Обновить местоположение
GET  /api/map/nearby             # Пользователи рядом
POST /api/map/routes             # Создать маршрут
GET  /api/map/routes             # Получить маршруты
POST /api/map/collectibles       # Создать коллекционный предмет
GET  /api/map/collectibles       # Получить предметы рядом
POST /api/map/collectibles/:id/collect # Собрать предмет
GET  /api/map/events             # События на карте
```

### Социальная лента
```
POST /api/feed                   # Создать пост
GET  /api/feed                   # Получить ленту
GET  /api/feed/:id               # Получить пост
PUT  /api/feed/:id               # Обновить пост
DELETE /api/feed/:id             # Удалить пост
POST /api/feed/:id/like          # Лайкнуть пост
DELETE /api/feed/:id/like        # Убрать лайк
POST /api/feed/:id/comments      # Создать комментарий
GET  /api/feed/:id/comments      # Получить комментарии
```

### Кошелек и геймификация
```
GET  /api/wallet/balance         # Получить баланс
GET  /api/wallet/transactions    # История транзакций
POST /api/wallet/transfer        # Перевод валюты
POST /api/wallet/purchase        # Покупка товара/услуги
GET  /api/wallet/achievements    # Достижения
GET  /api/wallet/badges          # Значки
GET  /api/wallet/stats           # Статистика
POST /api/wallet/bonus           # Начислить бонус (админ)
```

### DAO управление
```
POST /api/dao/proposals          # Создать предложение
GET  /api/dao/proposals          # Получить предложения
GET  /api/dao/proposals/:id      # Получить предложение
POST /api/dao/proposals/:id/vote # Голосовать
POST /api/dao/stakes             # Создать стейк
GET  /api/dao/stakes             # Получить стейки
GET  /api/dao/stats              # Статистика DAO
```

### Партнеры и услуги
```
POST /api/partners/profile       # Создать профиль партнера
GET  /api/partners/profile       # Получить профиль
PUT  /api/partners/profile       # Обновить профиль
POST /api/partners/services      # Создать услугу
GET  /api/partners/services      # Получить услуги
GET  /api/partners/search        # Поиск партнеров
POST /api/partners/bookings      # Бронирование услуги
GET  /api/partners/bookings      # Получить бронирования
PUT  /api/partners/bookings/:id/status # Обновить статус
```

### AI-помощник
```
POST /api/ai/ask                 # Задать вопрос
GET  /api/ai/history             # История взаимодействий
POST /api/ai/rate/:id            # Оценить ответ
GET  /api/ai/recommendations     # Получить рекомендации
GET  /api/ai/health-analysis/:dogId # Анализ здоровья
```

### Административная панель
```
POST /api/admin/profile          # Создать профиль админа
GET  /api/admin/profile          # Получить профиль
GET  /api/admin/stats            # Статистика
GET  /api/admin/users            # Список пользователей
PUT  /api/admin/users/:id        # Обновить пользователя
POST /api/admin/notifications    # Создать уведомление
GET  /api/admin/partners         # Список партнеров
PUT  /api/admin/partners/:id/verify # Верификация партнера
GET  /api/admin/logs             # Логи системы
```

## 🔐 Безопасность

### Аутентификация
- **JWT токены** с коротким временем жизни (15 минут)
- **Refresh токены** для обновления (7 дней)
- **Хеширование паролей** с bcrypt (12 раундов)
- **Сессии** в базе данных с возможностью отзыва

### Авторизация
- **Роли пользователей:** USER, PARTNER, ADMIN, SUPER_ADMIN
- **Middleware** для проверки прав доступа
- **Проверка владения** ресурсами (собаки, посты, etc.)

### Защита данных
- **HTTPS** для всех соединений
- **Валидация входных данных** с Zod
- **Rate limiting** для предотвращения атак
- **CORS** настройки для безопасности

## 📱 PWA функциональность

### Манифест
```json
{
  "name": "Dogymorbis",
  "short_name": "Dogymorbis",
  "description": "Социальная сеть для владельцев собак",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#f2751a",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
- **Кеширование** статических ресурсов
- **Офлайн режим** для базовой функциональности
- **Фоновая синхронизация** данных
- **Push уведомления**

## 🗺️ Интеграции

### Карты
- **Mapbox GL JS** для интерактивных карт
- **Геолокация** пользователей
- **Маршруты** и точки интереса
- **Кластеризация** маркеров

### Платежи
- **Stripe** для обработки платежей
- **Webhook** для обработки событий
- **Подписки** и разовые платежи
- **Мультивалютность**

### Уведомления
- **Firebase Cloud Messaging** для push
- **Email** уведомления через SMTP
- **SMS** уведомления (опционально)
- **In-app** уведомления

### AI
- **OpenAI API** для AI-помощника
- **Обработка естественного языка**
- **Персональные рекомендации**
- **Анализ данных**

## 📊 Мониторинг и аналитика

### Логирование
- **Structured logging** с Pino
- **Уровни логирования** (debug, info, warn, error)
- **Корреляция запросов** с trace ID
- **Ротация логов**

### Метрики
- **Prometheus** для сбора метрик
- **Grafana** для визуализации
- **Health checks** для мониторинга
- **Алерты** при проблемах

### Аналитика
- **Google Analytics** для веб-аналитики
- **Custom events** для отслеживания
- **A/B тестирование** функций
- **Конверсионная воронка**

## 🚀 Деплой

### Docker
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "start"]

# Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### CI/CD
```yaml
# GitHub Actions
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker-compose up -d
```

## 📈 Масштабирование

### Горизонтальное масштабирование
- **Load balancer** для распределения нагрузки
- **Микросервисы** для разделения ответственности
- **Кеширование** с Redis
- **CDN** для статических ресурсов

### Вертикальное масштабирование
- **Оптимизация запросов** к базе данных
- **Индексы** для быстрого поиска
- **Партиционирование** больших таблиц
- **Архивирование** старых данных

## 🔧 Разработка

### Локальная разработка
```bash
# Запуск с Docker
./start-dev.sh

# Или вручную
docker-compose -f docker-compose.dev.yml up -d postgres redis
cd backend && npm run dev
cd frontend && npm run dev
```

### Тестирование
```bash
# Backend тесты
cd backend && npm test

# Frontend тесты
cd frontend && npm test

# E2E тесты
npm run test:e2e
```

### Линтинг и форматирование
```bash
# Backend
cd backend && npm run lint && npm run format

# Frontend
cd frontend && npm run lint && npm run format
```

---

*Эти технические спецификации помогут разработчикам понять архитектуру и внести свой вклад в проект.*

