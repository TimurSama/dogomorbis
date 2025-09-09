# 🐕 Dogymorbis - Настройка и запуск

## Быстрый старт

### 1. Клонирование и установка зависимостей

```bash
# Клонируем репозиторий
git clone <repository-url>
cd dogomorbis

# Устанавливаем зависимости для всех частей проекта
npm run install:all
```

### 2. Настройка переменных окружения

```bash
# Создаем .env файл для backend
cp backend/env.example backend/.env

# Создаем .env.local файл для frontend
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
```

### 3. Запуск через Docker (рекомендуется)

```bash
# Запускаем все сервисы
./start-dev.sh

# Или вручную:
docker-compose -f docker-compose.dev.yml up --build -d
```

### 4. Запуск без Docker

```bash
# Терминал 1: Запуск базы данных
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Терминал 2: Backend
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev

# Терминал 3: Frontend
cd frontend
npm install
npm run dev
```

## 🌐 Доступные сервисы

После запуска будут доступны:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health
- **MailHog (Email тестирование)**: http://localhost:8025
- **pgAdmin**: http://localhost:5050 (admin@dogymorbis.com / admin123)

## 🔑 Тестовые аккаунты

- `dev@dogymorbis.com` / `password123` - Команда разработчиков
- `company@dogymorbis.com` / `password123` - Официальный аккаунт Dogymorbis
- `admin@dogymorbis.com` / `password123` - Администратор
- `user1@dogymorbis.com` / `password123` - Владелец Бобика
- `user2@dogymorbis.com` / `password123` - Владелец Мурки
- `partner@dogymorbis.com` / `password123` - Ветеринарная клиника

## 🛠️ Полезные команды

### Docker команды

```bash
# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Остановка всех сервисов
docker-compose -f docker-compose.dev.yml down

# Пересборка контейнеров
docker-compose -f docker-compose.dev.yml up --build -d

# Очистка данных
docker-compose -f docker-compose.dev.yml down -v
```

### База данных

```bash
# Миграции
npm run db:migrate

# Заполнение тестовыми данными
npm run db:seed

# Сброс базы данных
npm run db:reset

# Просмотр базы данных
npm run db:studio
```

### Разработка

```bash
# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Тестирование
npm run test

# Линтинг
npm run lint
```

## 🏗️ Архитектура проекта

```
dogomorbis/
├── backend/                 # Backend API (Fastify + TypeScript)
│   ├── src/
│   │   ├── routes/         # API роуты
│   │   ├── utils/          # Утилиты (косточкономика, уровни, достижения)
│   │   ├── middleware/     # Middleware
│   │   └── scripts/        # Скрипты (seed, миграции)
│   ├── prisma/             # Схема базы данных
│   └── Dockerfile.dev      # Docker для разработки
├── frontend/               # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── app/           # App Router (Next.js 13+)
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Утилиты и конфигурация
│   │   └── stores/        # Zustand stores
│   └── Dockerfile.dev     # Docker для разработки
├── docker-compose.yml      # Production Docker Compose
├── docker-compose.dev.yml  # Development Docker Compose
└── start-dev.sh           # Скрипт быстрого запуска
```

## 🎮 Новые функции

### 🦴 Косточкономика
- Сбор косточек на карте
- Разные типы косточек (обычные, золотые, игрушки)
- Автоматическая генерация косточек каждые 15 минут
- API: `/api/bones/*`

### 📊 Система уровней
- 10 уровней от "Новичок" до "Император собак"
- Опыт за различные действия
- Лидерборд пользователей
- API: `/api/levels/*`

### 🏆 Достижения
- 20+ различных достижений
- Категории: прогулки, тренировки, социальная активность
- Автоматическая проверка и выдача
- API: `/api/achievements/*`

### 👥 Реферальная программа
- Реферальные коды
- Награды за приглашения
- Статистика рефералов
- API: `/api/referrals/*`

## 🔧 Настройка для продакшена

1. Обновите переменные окружения в `backend/.env`
2. Используйте `docker-compose.yml` для продакшена
3. Настройте SSL сертификаты
4. Настройте мониторинг и логирование

## 📝 API Документация

Полная документация API доступна по адресу: http://localhost:3001/api/docs

### Основные эндпоинты:

- `GET /api/bones/nearby` - Получить косточки рядом
- `POST /api/bones/collect` - Собрать косточку
- `GET /api/levels/stats` - Статистика уровня
- `GET /api/levels/leaderboard` - Лидерборд
- `GET /api/achievements/user` - Достижения пользователя
- `POST /api/referrals/code` - Создать реферальный код
- `GET /api/referrals/stats` - Статистика рефералов

## 🐛 Отладка

### Проблемы с Docker
```bash
# Проверка статуса контейнеров
docker-compose -f docker-compose.dev.yml ps

# Просмотр логов конкретного сервиса
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend
```

### Проблемы с базой данных
```bash
# Подключение к базе данных
docker-compose -f docker-compose.dev.yml exec postgres psql -U dogymorbis -d dogymorbis_dev

# Сброс базы данных
docker-compose -f docker-compose.dev.yml exec backend npm run db:reset
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Остановка процессов на портах
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose -f docker-compose.dev.yml logs -f`
2. Убедитесь, что все порты свободны
3. Проверьте переменные окружения
4. Попробуйте пересобрать контейнеры: `docker-compose -f docker-compose.dev.yml up --build -d`

