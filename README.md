# Poetry Backend API

Backend API для поэтического веб-сайта на NestJS с Prisma и PostgreSQL.

## 🚀 Стек технологий

- **NestJS** - фреймворк для Node.js
- **Prisma** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **TypeScript** - типизация

## 📦 Установка

```bash
# Установить зависимости
npm install

# Скопировать .env.example в .env и настроить переменные окружения
cp .env.example .env
```

## ⚙️ Настройка .env

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/poetry?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

## 🗄️ База данных

```bash
# Генерация Prisma Client
npm run prisma:generate

# Создание и применение миграций
npm run prisma:migrate

# Открыть Prisma Studio
npm run prisma:studio
```

## 🏃 Запуск

```bash
# Development mode (с hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Backend будет доступен на `http://localhost:3001`

## 📡 API Endpoints

### Аутентификация

- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `POST /auth/logout` - Выход
- `GET /auth/profile` - Профиль (требует авторизации)
- `GET /auth/check` - Проверка авторизации

### Пользователи

- `GET /users/:id` - Получить пользователя
- `PUT /users/profile` - Обновить профиль (требует авторизации)
- `PUT /users/password` - Изменить пароль (требует авторизации)

### Категории

- `GET /categories` - Все категории
- `GET /categories/:id` - Категория по ID
- `GET /categories/slug/:slug` - Категория по slug

### Коллекции

- `GET /collections` - Все коллекции
- `GET /collections/:id` - Коллекция по ID
- `GET /collections/slug/:slug` - Коллекция по slug
- `GET /collections/category/:categoryId` - Коллекции категории

### Стихотворения

- `GET /poems` - Все стихотворения (с пагинацией)
- `GET /poems/:id` - Стихотворение по ID
- `GET /poems/slug/:slug` - Стихотворение по slug
- `GET /poems/collection/:collectionId` - Стихи коллекции
- `GET /poems/search?q=query` - Поиск стихов

### Комментарии

- `POST /comments` - Создать комментарий (требует авторизации)
- `GET /comments/poem/:poemId` - Комментарии к стихотворению
- `PUT /comments/:id` - Обновить комментарий (требует авторизации)
- `DELETE /comments/:id` - Удалить комментарий (требует авторизации)

### Избранное

- `POST /favorites/:poemId` - Добавить в избранное (требует авторизации)
- `DELETE /favorites/:poemId` - Удалить из избранного (требует авторизации)
- `GET /favorites` - Список избранного (требует авторизации)
- `GET /favorites/check/:poemId` - Проверить избранное (требует авторизации)

## 📊 Структура проекта

```
poetry-backend/
├── prisma/
│   └── schema.prisma          # Prisma схема
├── src/
│   ├── auth/                  # Модуль аутентификации
│   ├── users/                 # Модуль пользователей
│   ├── categories/            # Модуль категорий
│   ├── collections/           # Модуль коллекций
│   ├── poems/                 # Модуль стихотворений
│   ├── comments/              # Модуль комментариев
│   ├── favorites/             # Модуль избранного
│   ├── prisma/                # Prisma сервис
│   ├── app.module.ts          # Корневой модуль
│   └── main.ts                # Точка входа
├── package.json
└── tsconfig.json
```

## 🎭 Модели данных

- **User** - Пользователь
- **Category** - Категория (направление поэзии)
- **Collection** - Коллекция стихов (сборник)
- **Poem** - Стихотворение
- **Comment** - Комментарий к стихотворению
- **Favorite** - Избранное стихотворение

## 🔒 Аутентификация

API использует JWT токены, которые сохраняются в httpOnly cookies.

Для защищенных endpoints необходимо:
- Cookie `token` с JWT токеном
- Или header `Authorization: Bearer <token>`

## 📝 Разработка

```bash
# Форматирование кода
npm run format

# Линтинг
npm run lint

# Тесты
npm run test
```

## 🚀 Production

```bash
# Собрать проект
npm run build

# Запустить в production режиме
npm run start:prod
```

---

Made with ❤️ for Poetry lovers
