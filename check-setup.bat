@echo off
chcp 65001 >nul
echo 🔍 Проверка готовности проекта Dogymorbis...
echo.

echo 🐳 Проверка Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker установлен
    docker --version
) else (
    echo ❌ Docker не установлен
)

docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker Compose установлен
    docker-compose --version
) else (
    echo ❌ Docker Compose не установлен
)

echo.
echo 📦 Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js установлен
    node --version
) else (
    echo ❌ Node.js не установлен
)

npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm установлен
    npm --version
) else (
    echo ❌ npm не установлен
)

echo.
echo 📁 Проверка файлов проекта...

if exist "package.json" (
    echo ✅ Корневой package.json найден
) else (
    echo ❌ Корневой package.json не найден
)

if exist "docker-compose.dev.yml" (
    echo ✅ docker-compose.dev.yml найден
) else (
    echo ❌ docker-compose.dev.yml не найден
)

if exist "start-dev.sh" (
    echo ✅ start-dev.sh найден
) else (
    echo ❌ start-dev.sh не найден
)

if exist "backend\package.json" (
    echo ✅ Backend package.json найден
) else (
    echo ❌ Backend package.json не найден
)

if exist "frontend\package.json" (
    echo ✅ Frontend package.json найден
) else (
    echo ❌ Frontend package.json не найден
)

if exist "backend\prisma\schema.prisma" (
    echo ✅ Prisma схема найдена
) else (
    echo ❌ Prisma схема не найдена
)

echo.
echo 🔧 Проверка переменных окружения...

if exist "backend\.env" (
    echo ✅ Backend .env файл найден
) else (
    if exist "backend\env.example" (
        echo ❌ Backend .env файл не найден (есть env.example)
        echo 💡 Создайте .env файл: copy backend\env.example backend\.env
    ) else (
        echo ❌ Backend .env файл и env.example не найдены
    )
)

if exist "frontend\.env.local" (
    echo ✅ Frontend .env.local файл найден
) else (
    echo ❌ Frontend .env.local файл не найден
    echo 💡 Создайте .env.local файл с NEXT_PUBLIC_API_URL=http://localhost:3001
)

echo.
echo 📦 Проверка зависимостей...

if exist "node_modules" (
    echo ✅ Корневые зависимости установлены
) else (
    echo ❌ Корневые зависимости не установлены
    echo 💡 Установите: npm install
)

if exist "backend\node_modules" (
    echo ✅ Backend зависимости установлены
) else (
    echo ❌ Backend зависимости не установлены
    echo 💡 Установите: cd backend ^&^& npm install
)

if exist "frontend\node_modules" (
    echo ✅ Frontend зависимости установлены
) else (
    echo ❌ Frontend зависимости не установлены
    echo 💡 Установите: cd frontend ^&^& npm install
)

echo.
echo 📊 Итоговая оценка готовности:

set ERRORS=0

if not exist "package.json" set /a ERRORS+=1
if not exist "docker-compose.dev.yml" set /a ERRORS+=1
if not exist "start-dev.sh" set /a ERRORS+=1
if not exist "backend\package.json" set /a ERRORS+=1
if not exist "frontend\package.json" set /a ERRORS+=1
if not exist "backend\prisma\schema.prisma" set /a ERRORS+=1

if %ERRORS% equ 0 (
    echo 🎉 Проект готов к запуску!
    echo.
    echo 🚀 Для запуска выполните:
    echo    ./start-dev.sh
    echo.
    echo 📖 Подробные инструкции в файле SETUP.md
) else (
    echo ⚠️  Найдены критические проблемы. Исправьте их перед запуском.
    echo.
    echo 💡 Рекомендации:
    echo    1. Установите недостающие зависимости
    echo    2. Создайте файлы конфигурации
    echo    3. Освободите занятые порты
    echo    4. Повторите проверку: check-setup.bat
)

echo.
echo 📚 Дополнительная информация:
echo    • Документация: SETUP.md
echo    • API документация: http://localhost:3001/api/docs (после запуска)
echo    • Логи: docker-compose -f docker-compose.dev.yml logs -f

pause

