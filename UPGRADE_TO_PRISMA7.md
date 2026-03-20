# 🚀 Обновление до Prisma 7

## ⚠️ Текущая версия: Prisma 6.10.1

Backend использует **Prisma 6**, потому что твоя версия Node.js (v20.11.1) не поддерживается Prisma 7.

## Требования для Prisma 7

- **Node.js** v20.19+, v22.12+, или v24.0+

## Как обновить Node.js

### Windows:

1. Скачай последнюю версию: https://nodejs.org/
2. Установи Node.js v22 LTS (рекомендуется)
3. Проверь версию: `node -v`

### Или через nvm-windows:

```bash
# Установи nvm-windows
# https://github.com/coreybutler/nvm-windows/releases

# Установи Node.js 22
nvm install 22
nvm use 22

# Проверь версию
node -v
```

## После обновления Node.js

### 1. Обновить package.json

```json
{
  "dependencies": {
    "@prisma/client": "^7.2.0",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "prisma": "^7.2.0"
  }
}
```

### 2. Создать prisma.config.ts

Создай файл `prisma.config.ts` в корне проекта:

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### 3. Обновить prisma/schema.prisma

Убери `url` из datasource:

```prisma
datasource db {
  provider = "postgresql"
  // Убери эту строку:
  // url = env("DATABASE_URL")
}
```

### 4. Переустановить зависимости

```bash
# Удали node_modules
rm -rf node_modules
rm package-lock.json

# Установи заново
npm install

# Генерируй Prisma Client
npx prisma generate

# Примени миграции
npx prisma migrate dev
```

## Основные изменения Prisma 7

1. **Новый конфиг файл** - `prisma.config.ts` вместо параметров в schema.prisma
2. **Улучшенная производительность**
3. **Новые фичи** - лучшая поддержка TypeScript
4. **Убрали `url`** из datasource в пользу конфига

## Если не хочешь обновляться

Prisma 6 работает отлично! Можешь оставить текущую версию, она стабильна и поддерживается.

---

**Документация Prisma 7:**
- https://pris.ly/d/config-datasource
- https://pris.ly/d/prisma7-client-config
