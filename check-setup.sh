#!/bin/bash

echo "🔍 Проверка готовности проекта Dogymorbis..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для проверки
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Проверка Docker
echo -e "\n${YELLOW}🐳 Проверка Docker...${NC}"
if command -v docker &> /dev/null; then
    check_status 0 "Docker установлен"
    docker --version
else
    check_status 1 "Docker не установлен"
fi

if command -v docker-compose &> /dev/null; then
    check_status 0 "Docker Compose установлен"
    docker-compose --version
else
    check_status 1 "Docker Compose не установлен"
fi

# Проверка Node.js
echo -e "\n${YELLOW}📦 Проверка Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        check_status 0 "Node.js версии $(node --version) установлен"
    else
        check_status 1 "Node.js версии $(node --version) установлен (требуется >= 18)"
    fi
else
    check_status 1 "Node.js не установлен"
fi

if command -v npm &> /dev/null; then
    check_status 0 "npm установлен"
    npm --version
else
    check_status 1 "npm не установлен"
fi

# Проверка файлов проекта
echo -e "\n${YELLOW}📁 Проверка файлов проекта...${NC}"

if [ -f "package.json" ]; then
    check_status 0 "Корневой package.json найден"
else
    check_status 1 "Корневой package.json не найден"
fi

if [ -f "docker-compose.dev.yml" ]; then
    check_status 0 "docker-compose.dev.yml найден"
else
    check_status 1 "docker-compose.dev.yml не найден"
fi

if [ -f "start-dev.sh" ]; then
    check_status 0 "start-dev.sh найден"
    chmod +x start-dev.sh
else
    check_status 1 "start-dev.sh не найден"
fi

if [ -f "backend/package.json" ]; then
    check_status 0 "Backend package.json найден"
else
    check_status 1 "Backend package.json не найден"
fi

if [ -f "frontend/package.json" ]; then
    check_status 0 "Frontend package.json найден"
else
    check_status 1 "Frontend package.json не найден"
fi

if [ -f "backend/prisma/schema.prisma" ]; then
    check_status 0 "Prisma схема найдена"
else
    check_status 1 "Prisma схема не найдена"
fi

# Проверка переменных окружения
echo -e "\n${YELLOW}🔧 Проверка переменных окружения...${NC}"

if [ -f "backend/.env" ]; then
    check_status 0 "Backend .env файл найден"
else
    if [ -f "backend/env.example" ]; then
        check_status 1 "Backend .env файл не найден (есть env.example)"
        echo -e "${YELLOW}💡 Создайте .env файл: cp backend/env.example backend/.env${NC}"
    else
        check_status 1 "Backend .env файл и env.example не найдены"
    fi
fi

if [ -f "frontend/.env.local" ]; then
    check_status 0 "Frontend .env.local файл найден"
else
    check_status 1 "Frontend .env.local файл не найден"
    echo -e "${YELLOW}💡 Создайте .env.local файл с NEXT_PUBLIC_API_URL=http://localhost:3001${NC}"
fi

# Проверка портов
echo -e "\n${YELLOW}🌐 Проверка портов...${NC}"

if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    check_status 1 "Порт 3000 занят"
else
    check_status 0 "Порт 3000 свободен"
fi

if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
    check_status 1 "Порт 3001 занят"
else
    check_status 0 "Порт 3001 свободен"
fi

if netstat -tuln 2>/dev/null | grep -q ":5432 "; then
    check_status 1 "Порт 5432 (PostgreSQL) занят"
else
    check_status 0 "Порт 5432 (PostgreSQL) свободен"
fi

# Проверка Docker контейнеров
echo -e "\n${YELLOW}🐳 Проверка Docker контейнеров...${NC}"

if docker ps -a --format "table {{.Names}}" | grep -q "dogymorbis"; then
    echo -e "${YELLOW}⚠️  Найдены существующие контейнеры Dogymorbis${NC}"
    docker ps -a --filter "name=dogymorbis" --format "table {{.Names}}\t{{.Status}}"
    echo -e "${YELLOW}💡 Для очистки: docker-compose -f docker-compose.dev.yml down -v${NC}"
else
    check_status 0 "Нет конфликтующих контейнеров Dogymorbis"
fi

# Проверка зависимостей
echo -e "\n${YELLOW}📦 Проверка зависимостей...${NC}"

if [ -d "node_modules" ]; then
    check_status 0 "Корневые зависимости установлены"
else
    check_status 1 "Корневые зависимости не установлены"
    echo -e "${YELLOW}💡 Установите: npm install${NC}"
fi

if [ -d "backend/node_modules" ]; then
    check_status 0 "Backend зависимости установлены"
else
    check_status 1 "Backend зависимости не установлены"
    echo -e "${YELLOW}💡 Установите: cd backend && npm install${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    check_status 0 "Frontend зависимости установлены"
else
    check_status 1 "Frontend зависимости не установлены"
    echo -e "${YELLOW}💡 Установите: cd frontend && npm install${NC}"
fi

# Итоговая оценка
echo -e "\n${YELLOW}📊 Итоговая оценка готовности:${NC}"

# Подсчет ошибок (упрощенная версия)
ERRORS=0

# Проверяем критические компоненты
[ ! -f "package.json" ] && ((ERRORS++))
[ ! -f "docker-compose.dev.yml" ] && ((ERRORS++))
[ ! -f "start-dev.sh" ] && ((ERRORS++))
[ ! -f "backend/package.json" ] && ((ERRORS++))
[ ! -f "frontend/package.json" ] && ((ERRORS++))
[ ! -f "backend/prisma/schema.prisma" ] && ((ERRORS++))

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Проект готов к запуску!${NC}"
    echo -e "\n${YELLOW}🚀 Для запуска выполните:${NC}"
    echo -e "   ${GREEN}./start-dev.sh${NC}"
    echo -e "\n${YELLOW}📖 Подробные инструкции в файле SETUP.md${NC}"
else
    echo -e "${RED}⚠️  Найдены критические проблемы. Исправьте их перед запуском.${NC}"
    echo -e "\n${YELLOW}💡 Рекомендации:${NC}"
    echo -e "   1. Установите недостающие зависимости"
    echo -e "   2. Создайте файлы конфигурации"
    echo -e "   3. Освободите занятые порты"
    echo -e "   4. Повторите проверку: ${GREEN}./check-setup.sh${NC}"
fi

echo -e "\n${YELLOW}📚 Дополнительная информация:${NC}"
echo -e "   • Документация: SETUP.md"
echo -e "   • API документация: http://localhost:3001/api/docs (после запуска)"
echo -e "   • Логи: docker-compose -f docker-compose.dev.yml logs -f"

