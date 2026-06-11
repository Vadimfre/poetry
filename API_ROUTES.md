# 🗺️ API Routes Map

## 📍 Base URL: `http://localhost:3001`

---

## 🔐 Auth (`/auth`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Регистрация пользователя |
| POST | `/auth/login` | Вход пользователя |
| POST | `/auth/logout` | Выход пользователя |
| GET | `/auth/profile` | Получить профиль (требует JWT) |
| GET | `/auth/check` | Проверить авторизацию (требует JWT) |

---

## 👤 Users (`/users`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/users` | Получить всех пользователей |
| GET | `/users/:id` | Получить пользователя по ID |
| PUT | `/users/:id` | Обновить пользователя |
| DELETE | `/users/:id` | Удалить пользователя |

---

## 📚 Categories (`/categories`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/categories` | Получить все категории |
| GET | `/categories/slug/:slug` | Получить категорию по slug |
| GET | `/categories/:id` | Получить категорию по ID |

---

## 📖 Collections (`/collections`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/collections` | Получить все коллекции |
| GET | `/collections/slug/:slug` | Получить коллекцию по slug |
| GET | `/collections/category/:categoryId` | Получить коллекции по категории |
| GET | `/collections/:id` | Получить коллекцию по ID |

---

## ✍️ Poems (`/poems`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/poems` | Получить все стихи (пагинация: `?page=1&limit=20`) |
| GET | `/poems/search` | Поиск стихов (`?q=query`) |
| GET | `/poems/slug/:slug` | Получить стих по slug |
| GET | `/poems/collection/:collectionId` | Получить стихи коллекции |
| GET | `/poems/category/:categorySlug` | Получить стихи категории |
| GET | `/poems/:id` | Получить стих по ID |

---

## 💬 Comments (`/comments`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/comments` | Получить все комментарии |
| GET | `/comments/poem/:poemId` | Получить комментарии стиха |
| POST | `/comments` | Создать комментарий (требует JWT) |
| PUT | `/comments/:id` | Обновить комментарий (требует JWT) |
| DELETE | `/comments/:id` | Удалить комментарий (требует JWT) |

---

## ⭐ Favorites (`/favorites`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/favorites` | Получить избранное пользователя (требует JWT) |
| POST | `/favorites/:poemId` | Добавить в избранное (требует JWT) |
| DELETE | `/favorites/:poemId` | Удалить из избранного (требует JWT) |

---

## 📝 Примеры запросов:

### Получить все категории:
```bash
GET http://localhost:3001/categories
```

### Получить коллекцию по slug:
```bash
GET http://localhost:3001/collections/slug/love-lyrics
```

### Получить стихи категории:
```bash
GET http://localhost:3001/poems/category/love-lyrics
```

### Поиск стихов:
```bash
GET http://localhost:3001/poems/search?q=любовь
```

### Получить стихи с пагинацией:
```bash
GET http://localhost:3001/poems?page=1&limit=20
```

---

**Все маршруты с JWT требуют токен в httpOnly cookie (устанавливается автоматически при логине)**
