# 🚀 Руководство по деплою Dogymorbis

## Подготовка к продакшн деплою

### 1. Системные требования

- Docker и Docker Compose
- Минимум 2GB RAM
- Минимум 10GB свободного места
- SSL сертификаты (или самоподписанные для тестирования)

### 2. Настройка переменных окружения

1. Скопируйте файл с примером переменных:
```bash
cp env.production.example .env
```

2. Заполните все необходимые переменные в файле `.env`:
   - `POSTGRES_PASSWORD` - надежный пароль для PostgreSQL
   - `REDIS_PASSWORD` - надежный пароль для Redis
   - `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
   - `JWT_REFRESH_SECRET` - секретный ключ для refresh токенов (минимум 32 символа)

### 3. SSL сертификаты

Для продакшн используйте реальные SSL сертификаты от Let's Encrypt или другого провайдера.

Для тестирования скрипт автоматически создаст самоподписанные сертификаты.

### 4. Деплой

#### Автоматический деплой

```bash
# Установите переменные окружения
export POSTGRES_PASSWORD="your_secure_password"
export REDIS_PASSWORD="your_secure_password"
export JWT_SECRET="your_very_long_jwt_secret_key"
export JWT_REFRESH_SECRET="your_very_long_refresh_secret_key"

# Запустите деплой
./deploy.sh
```

#### Ручной деплой

```bash
# Остановите существующие контейнеры
docker-compose -f docker-compose.prod.yml down

# Соберите и запустите контейнеры
docker-compose -f docker-compose.prod.yml up --build -d

# Проверьте статус
docker-compose -f docker-compose.prod.yml ps
```

### 5. Проверка деплоя

После деплоя проверьте доступность сервисов:

- **Frontend**: http://localhost (или ваш домен)
- **Backend API**: http://localhost:3001
- **База данных**: localhost:5432
- **Redis**: localhost:6379

### 6. Мониторинг

#### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.prod.yml logs

# Конкретный сервис
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

#### Проверка здоровья сервисов

```bash
# Backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000

# Nginx
curl http://localhost
```

### 7. Обновление приложения

```bash
# Остановите контейнеры
docker-compose -f docker-compose.prod.yml down

# Обновите код
git pull origin main

# Пересоберите и запустите
docker-compose -f docker-compose.prod.yml up --build -d
```

### 8. Резервное копирование

#### База данных

```bash
# Создание бэкапа
docker exec dogymorbis-postgres pg_dump -U dogymorbis dogymorbis > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из бэкапа
docker exec -i dogymorbis-postgres psql -U dogymorbis dogymorbis < backup_file.sql
```

#### Redis

```bash
# Создание бэкапа
docker exec dogymorbis-redis redis-cli --rdb /data/dump.rdb
docker cp dogymorbis-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

### 9. Масштабирование

Для увеличения производительности:

1. **Увеличьте ресурсы контейнеров** в `docker-compose.prod.yml`
2. **Добавьте реплики** для backend и frontend
3. **Настройте load balancer** для распределения нагрузки
4. **Используйте внешние сервисы** для базы данных и Redis

### 10. Безопасность

- Регулярно обновляйте пароли
- Используйте HTTPS в продакшн
- Настройте firewall
- Регулярно обновляйте Docker образы
- Мониторьте логи на предмет подозрительной активности

### 11. Troubleshooting

#### Проблемы с запуском

1. Проверьте логи: `docker-compose -f docker-compose.prod.yml logs`
2. Убедитесь, что все переменные окружения установлены
3. Проверьте доступность портов
4. Убедитесь, что SSL сертификаты корректны

#### Проблемы с производительностью

1. Увеличьте ресурсы контейнеров
2. Настройте кэширование в Nginx
3. Оптимизируйте запросы к базе данных
4. Используйте CDN для статических файлов

### 12. Поддержка

При возникновении проблем:

1. Проверьте логи сервисов
2. Убедитесь в корректности конфигурации
3. Проверьте доступность внешних сервисов
4. Обратитесь к документации Docker и Nginx

---

**Важно**: Всегда тестируйте деплой в staging окружении перед продакшн!

