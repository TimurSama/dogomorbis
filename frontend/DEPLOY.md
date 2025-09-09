# 🚀 Инструкция по деплою Dogymorbis

## Автоматический деплой на GitHub Pages

### 1. Настройка репозитория

1. Создайте новый репозиторий на GitHub
2. Скопируйте файлы проекта в репозиторий
3. Включите GitHub Pages в настройках репозитория:
   - Settings → Pages
   - Source: GitHub Actions

### 2. Деплой

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/dogymorbis.git
cd dogymorbis

# Скопируйте файлы frontend
cp -r dogomorbis-new/frontend/* .

# Добавьте изменения
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Проверка

После пуша в ветку `main`:
1. GitHub Actions автоматически соберет проект
2. Деплоит на GitHub Pages
3. URL будет: `https://yourusername.github.io/dogymorbis`

## Ручной деплой на Vercel

### 1. Установка Vercel CLI

```bash
npm i -g vercel
```

### 2. Деплой

```bash
cd frontend
vercel
```

### 3. Настройка

- Project Name: `dogymorbis`
- Framework: `Next.js`
- Build Command: `npm run build`
- Output Directory: `dist`

## Ручной деплой на Netlify

### 1. Сборка

```bash
cd frontend
npm run build
```

### 2. Загрузка

1. Зайдите на [netlify.com](https://netlify.com)
2. Drag & Drop папку `dist`
3. Настройте домен

## Ручной деплой на любой хостинг

### 1. Сборка

```bash
cd frontend
npm run build
```

### 2. Загрузка файлов

Загрузите содержимое папки `dist` на ваш хостинг:
- Apache/Nginx
- Shared hosting
- VPS/Dedicated server

### 3. Настройка сервера

Для Apache создайте `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# PWA поддержка
<Files "manifest.json">
    Header set Content-Type "application/manifest+json"
</Files>

# Кэширование
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

## Переменные окружения

Создайте `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.dogymorbis.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Проверка после деплоя

1. ✅ Приложение загружается
2. ✅ PWA работает (можно установить)
3. ✅ Все страницы открываются
4. ✅ Анимации работают
5. ✅ Адаптивность на мобильных
6. ✅ SEO мета-теги
7. ✅ Безопасность заголовков

## Мониторинг

- **Google Analytics**: Добавьте tracking ID
- **Sentry**: Для отслеживания ошибок
- **Lighthouse**: Проверка производительности

## Обновления

Для обновления приложения:

```bash
git pull origin main
git push origin main
```

GitHub Actions автоматически пересоберет и задеплоит новую версию.

