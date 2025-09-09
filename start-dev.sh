#!/bin/bash

echo "🐕 Запуск Dogymorbis в режиме разработки..."

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker и попробуйте снова."
    exit 1
fi

# Проверяем, установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose и попробуйте снова."
    exit 1
fi

# Создаем .env файлы если их нет
if [ ! -f backend/.env ]; then
    echo "📝 Создаем .env файл для backend..."
    cp backend/env.example backend/.env
    echo "⚠️  Пожалуйста, отредактируйте backend/.env файл с вашими настройками"
fi

if [ ! -f frontend/.env.local ]; then
    echo "📝 Создаем .env.local файл для frontend..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
fi

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose -f docker-compose.dev.yml down

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose -f docker-compose.dev.yml up --build -d

# Ждем, пока база данных будет готова
echo "⏳ Ждем, пока база данных будет готова..."
sleep 10

# Запускаем миграции
echo "🗄️  Запускаем миграции базы данных..."
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev --name init

# Заполняем базу данных тестовыми данными
echo "🌱 Заполняем базу данных тестовыми данными..."
docker-compose -f docker-compose.dev.yml exec backend npm run db:seed

echo "✅ Dogymorbis запущен!"
echo ""
echo "🌐 Доступные сервисы:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   API Documentation: http://localhost:3001/api/docs"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo "🔑 Тестовые аккаунты:"
echo "   dev@dogymorbis.com / password123 (Команда разработчиков)"
echo "   company@dogymorbis.com / password123 (Официальный аккаунт Dogymorbis)"
echo "   admin@dogymorbis.com / password123 (Администратор)"
echo "   user1@dogymorbis.com / password123 (Владелец Бобика)"
echo "   user2@dogymorbis.com / password123 (Владелец Мурки)"
echo "   partner@dogymorbis.com / password123 (Ветеринарная клиника)"
echo ""
echo "📊 Для просмотра логов используйте:"
echo "   docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "🛑 Для остановки используйте:"
echo "   docker-compose -f docker-compose.dev.yml down"












