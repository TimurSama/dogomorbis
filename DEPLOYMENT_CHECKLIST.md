# 🚀 Чек-лист для деплоя Dogymorbis

## ✅ Предварительная проверка

### 1. Локальная разработка
- [ ] Проект запускается локально: `./start-dev.sh`
- [ ] Все тесты проходят: `npm run test`
- [ ] Линтер не показывает ошибок: `npm run lint`
- [ ] Проверка готовности: `./check-setup.sh`

### 2. База данных
- [ ] Миграции применены: `npm run db:migrate`
- [ ] Тестовые данные загружены: `npm run db:seed`
- [ ] Резервная копия создана (для продакшена)

### 3. Переменные окружения
- [ ] `backend/.env` настроен для продакшена
- [ ] `frontend/.env.local` настроен для продакшена
- [ ] Все секретные ключи обновлены
- [ ] API ключи для внешних сервисов настроены

## 🏗️ Подготовка к деплою

### 1. Сборка проекта
```bash
# Сборка всех компонентов
npm run build

# Проверка сборки
npm run test
```

### 2. Docker образы
```bash
# Сборка production образов
docker-compose -f docker-compose.prod.yml build

# Тестирование production сборки
docker-compose -f docker-compose.prod.yml up -d
```

### 3. База данных (продакшен)
```bash
# Применение миграций
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:deploy

# Загрузка начальных данных (опционально)
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed
```

## 🌐 Настройка сервера

### 1. Системные требования
- [ ] Ubuntu 20.04+ или аналогичная ОС
- [ ] Docker и Docker Compose установлены
- [ ] Nginx установлен и настроен
- [ ] SSL сертификаты получены
- [ ] Домен настроен

### 2. Переменные окружения (продакшен)
```bash
# Backend .env
DATABASE_URL="postgresql://user:password@postgres:5432/dogymorbis_prod"
JWT_SECRET="your-super-secure-jwt-secret"
NODE_ENV="production"
CORS_ORIGIN="https://yourdomain.com"
REDIS_URL="redis://redis:6379"

# Frontend .env.local
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_WS_URL="wss://api.yourdomain.com"
```

### 3. Nginx конфигурация
```nginx
# /etc/nginx/sites-available/dogymorbis
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚀 Процесс деплоя

### 1. Загрузка кода на сервер
```bash
# Клонирование репозитория
git clone <repository-url> /var/www/dogymorbis
cd /var/www/dogymorbis

# Переключение на production ветку
git checkout production
git pull origin production
```

### 2. Настройка окружения
```bash
# Создание .env файлов
cp backend/env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Редактирование переменных окружения
nano backend/.env
nano frontend/.env.local
```

### 3. Запуск сервисов
```bash
# Остановка существующих контейнеров
docker-compose -f docker-compose.prod.yml down

# Сборка и запуск
docker-compose -f docker-compose.prod.yml up --build -d

# Применение миграций
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:deploy

# Перезапуск Nginx
sudo systemctl reload nginx
```

### 4. Проверка деплоя
```bash
# Проверка статуса контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверка логов
docker-compose -f docker-compose.prod.yml logs -f

# Проверка доступности
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/health
```

## 📊 Мониторинг и логирование

### 1. Логи
```bash
# Просмотр логов всех сервисов
docker-compose -f docker-compose.prod.yml logs -f

# Логи конкретного сервиса
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Мониторинг ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Использование дискового пространства
df -h
docker system df

# Использование памяти
free -h
```

### 3. Резервное копирование
```bash
# Создание резервной копии базы данных
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dogymorbis dogymorbis_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из резервной копии
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U dogymorbis dogymorbis_prod < backup_file.sql
```

## 🔧 Обслуживание

### 1. Обновление приложения
```bash
# Получение обновлений
git pull origin production

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml up --build -d

# Применение новых миграций (если есть)
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate:deploy
```

### 2. Очистка системы
```bash
# Очистка неиспользуемых Docker образов
docker system prune -a

# Очистка логов
sudo journalctl --vacuum-time=7d

# Очистка старых резервных копий
find /var/backups -name "backup_*.sql" -mtime +30 -delete
```

### 3. Масштабирование
```bash
# Увеличение количества экземпляров backend
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d

# Настройка load balancer в Nginx
upstream backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

## 🚨 Устранение неполадок

### 1. Проблемы с запуском
```bash
# Проверка статуса контейнеров
docker-compose -f docker-compose.prod.yml ps

# Проверка логов
docker-compose -f docker-compose.prod.yml logs

# Перезапуск сервисов
docker-compose -f docker-compose.prod.yml restart
```

### 2. Проблемы с базой данных
```bash
# Проверка подключения к БД
docker-compose -f docker-compose.prod.yml exec backend npm run db:studio

# Восстановление из резервной копии
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U dogymorbis dogymorbis_prod < backup.sql
```

### 3. Проблемы с производительностью
```bash
# Мониторинг ресурсов
docker stats
htop

# Оптимизация базы данных
docker-compose -f docker-compose.prod.yml exec postgres psql -U dogymorbis dogymorbis_prod -c "VACUUM ANALYZE;"
```

## 📋 Чек-лист после деплоя

- [ ] Сайт доступен по HTTPS
- [ ] API отвечает на запросы
- [ ] База данных работает корректно
- [ ] WebSocket соединения работают
- [ ] Email уведомления отправляются
- [ ] Файлы загружаются корректно
- [ ] Мониторинг настроен
- [ ] Резервное копирование работает
- [ ] SSL сертификат действителен
- [ ] Производительность в норме

## 🔐 Безопасность

### 1. Обновления безопасности
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Обновление Docker
sudo apt install docker-ce docker-ce-cli containerd.io

# Обновление Nginx
sudo apt install nginx
```

### 2. Настройка файрвола
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Мониторинг безопасности
```bash
# Проверка открытых портов
sudo netstat -tulpn

# Мониторинг подозрительной активности
sudo tail -f /var/log/auth.log
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs -f`
2. Проверьте статус сервисов: `docker-compose -f docker-compose.prod.yml ps`
3. Проверьте ресурсы: `docker stats`
4. Создайте резервную копию перед изменениями
5. Обратитесь к документации: SETUP.md

