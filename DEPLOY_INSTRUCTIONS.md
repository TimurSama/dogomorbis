# 🚀 Инструкции по деплою Dogymorbis

## 📋 Быстрый деплой для демонстрации партнерам

### 1. Frontend (Vercel) - Рекомендуется
1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите репозиторий `TimurSama/dogomorbis`
5. Настройте:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Добавьте переменные окружения:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   ```
7. Нажмите "Deploy"

### 2. Backend (Railway) - Простой вариант
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project" → "Deploy from GitHub repo"
4. Выберите `TimurSama/dogomorbis`
5. Настройте:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Добавьте PostgreSQL базу данных
7. Добавьте переменные окружения:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   PORT=3001
   ```

### 3. Альтернативный деплой (Heroku)
1. Установите [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Войдите: `heroku login`
3. Создайте приложение: `heroku create dogomorbis-backend`
4. Добавьте PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Деплой: `git subtree push --prefix=backend heroku main`

## 🔧 Настройка для продакшена

### Переменные окружения Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_APP_URL=https://your-frontend-url.com
```

### Переменные окружения Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-url.com
```

## 📱 Демо для партнеров

### Что показать:
1. **Главная страница** - гостевой режим с полным доступом
2. **Карта** - Google Maps интеграция
3. **Лента** - Instagram/Facebook/DAO стиль
4. **Профиль** - форма регистрации
5. **Магазин** - товары и награды
6. **Друзья** - поиск и знакомства
7. **События** - мероприятия
8. **Достижения** - система наград
9. **Настройки** - полная панель

### Ключевые особенности:
- ✅ **Studio Ghibli дизайн** с пастельными цветами
- ✅ **Полностью функциональный** гостевой режим
- ✅ **Все страницы работают** без регистрации
- ✅ **Современный UX/UI** с анимациями
- ✅ **Мобильная адаптация** + PC поддержка
- ✅ **Готов к масштабированию**

## 🎯 Следующие шаги

1. **Получить Google Maps API ключ** для карты
2. **Настроить базу данных** для пользователей
3. **Добавить платежную систему** для кошелька
4. **Интегрировать push-уведомления**
5. **Добавить реальные данные** партнеров

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel/Railway
2. Убедитесь в правильности переменных окружения
3. Проверьте подключение к базе данных

---

**Готово к демонстрации партнерам!** 🐕✨
