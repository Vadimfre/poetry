# 🚀 Инструкция по запуску Poetry Backend

> ⚠️ **Версия:** Prisma 6.10.1 (для совместимости с Node.js v20.11.1)  
> Хочешь Prisma 7? Смотри `UPGRADE_TO_PRISMA7.md`

## Шаг 1: Установка PostgreSQL

Убедитесь, что у вас установлен **PostgreSQL**.

Скачать можно здесь: https://www.postgresql.org/download/

После установки создайте базу данных:

```sql
CREATE DATABASE poetry;
```

## Шаг 2: Настройка .env

Создайте файл `.env` в корне `poetry-backend/`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/poetry?schema=public"
JWT_SECRET="poetry-super-secret-jwt-key-2026"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Замените `YOUR_PASSWORD` на ваш пароль от PostgreSQL!**

## Шаг 3: Установка зависимостей

```bash
cd poetry-backend
npm install
```

## Шаг 4: Генерация Prisma Client

```bash
npx prisma generate
```

Эта команда создаст Prisma Client в папке `generated/prisma/`.

## Шаг 5: Применение миграций

```bash
npx prisma migrate dev --name init
```

Эта команда:
- Создаст все таблицы в базе данных
- Применит схему из `prisma/schema.prisma`

## Шаг 6: Заполнение тестовыми данными (опционально)

```bash
npx ts-node prisma/seed.ts
```

Это создаст:
- ✅ Тестового пользователя: `test@poetry.com` / `password123`
- ✅ 5 категорий поэзии
- ✅ 2 коллекции стихов
- ✅ 3 стихотворения (Пушкин, Лермонтов)

## Шаг 7: Запуск backend

### Development режим (с hot-reload):

```bash
npm run start:dev
```

### Production режим:

```bash
npm run build
npm run start:prod
```

Backend будет доступен на **http://localhost:3001**

## ✅ Проверка работы

Откройте в браузере или Postman:

```
http://localhost:3001
```

Должно вернуться: `Poetry Backend API v1.0 🎭📚`

### Health Check:

```
http://localhost:3001/health
```

## 🔧 Полезные команды

```bash
# Посмотреть базу данных через Prisma Studio
npx prisma studio

# Создать новую миграцию
npx prisma migrate dev --name your_migration_name

# Сбросить базу данных и применить миграции заново
npx prisma migrate reset

# Форматирование кода
npm run format

# Линтинг
npm run lint
```

## 🐛 Проблемы и решения

### Ошибка подключения к базе данных

- Проверьте, что PostgreSQL запущен
- Проверьте правильность `DATABASE_URL` в `.env`
- Проверьте, что база данных `poetry` создана

### Ошибка "Cannot find module '../../generated/prisma'"

- Запустите `npx prisma generate`
- Убедитесь, что папка `generated/prisma` создана

### Порт 3001 уже занят

- Измените `PORT` в `.env` на другой порт (например, 3002)

## 📚 Документация API

Смотрите `README.md` для полного списка endpoints и примеров использования.

---

**Готово!** Backend должен работать 🚀
