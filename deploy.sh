#!/bin/bash

# Скрипт для деплоя Dogymorbis в продакшн

set -e

echo "🚀 Начинаем деплой Dogymorbis..."

# Проверяем наличие необходимых переменных окружения
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ Ошибка: POSTGRES_PASSWORD не установлен"
    exit 1
fi

if [ -z "$REDIS_PASSWORD" ]; then
    echo "❌ Ошибка: REDIS_PASSWORD не установлен"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Ошибка: JWT_SECRET не установлен"
    exit 1
fi

if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo "❌ Ошибка: JWT_REFRESH_SECRET не установлен"
    exit 1
fi

# Создаем директорию для SSL сертификатов если её нет
mkdir -p ssl

# Проверяем наличие SSL сертификатов
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    echo "⚠️  SSL сертификаты не найдены. Создаем самоподписанные сертификаты..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=RU/ST=Moscow/L=Moscow/O=Dogymorbis/CN=dogymorbis.com"
fi

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose -f docker-compose.prod.yml down

# Собираем и запускаем контейнеры
echo "🔨 Собираем и запускаем контейнеры..."
docker-compose -f docker-compose.prod.yml up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 30

# Проверяем статус сервисов
echo "🔍 Проверяем статус сервисов..."
docker-compose -f docker-compose.prod.yml ps

# Проверяем здоровье сервисов
echo "🏥 Проверяем здоровье сервисов..."

# Проверяем backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend работает"
else
    echo "❌ Backend не отвечает"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Проверяем frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "❌ Frontend не отвечает"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# Проверяем nginx
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Nginx работает"
else
    echo "❌ Nginx не отвечает"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

echo "🎉 Деплой завершен успешно!"
echo "📱 Приложение доступно по адресу: http://localhost"
echo "🔒 HTTPS доступен по адресу: https://localhost"
echo "📊 Backend API: http://localhost:3001"
echo "🗄️  База данных: localhost:5432"
echo "🔄 Redis: localhost:6379"

# Показываем логи
echo "📋 Последние логи:"
docker-compose -f docker-compose.prod.yml logs --tail=20

