# 🔗 Интеграция Frontend с Backend

## Настройка фронтенда

### 1. Установить Axios

```bash
cd ../  # Вернуться в корень проекта
npm install axios
```

### 2. Создать API клиент

Создайте файл `lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Важно для cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для автоматического добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Создать Auth сервис

Создайте файл `services/auth.service.ts`:

```typescript
import { api } from '@/lib/api';

export const authService = {
  async register(email: string, password: string, name?: string) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async checkAuth() {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
```

### 4. Создать Poems сервис

Создайте файл `services/poems.service.ts`:

```typescript
import { api } from '@/lib/api';

export const poemsService = {
  async getAll(page = 1, limit = 20) {
    const response = await api.get(`/poems?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getOne(id: number) {
    const response = await api.get(`/poems/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get(`/poems/slug/${slug}`);
    return response.data;
  },

  async getByCollection(collectionId: number) {
    const response = await api.get(`/poems/collection/${collectionId}`);
    return response.data;
  },

  async search(query: string) {
    const response = await api.get(`/poems/search?q=${query}`);
    return response.data;
  },
};
```

### 5. Создать Collections сервис

Создайте файл `services/collections.service.ts`:

```typescript
import { api } from '@/lib/api';

export const collectionsService = {
  async getAll() {
    const response = await api.get('/collections');
    return response.data;
  },

  async getOne(id: number) {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },

  async getBySlug(slug: string) {
    const response = await api.get(`/collections/slug/${slug}`);
    return response.data;
  },

  async getByCategory(categoryId: number) {
    const response = await api.get(`/collections/category/${categoryId}`);
    return response.data;
  },
};
```

### 6. Создать Comments сервис

Создайте файл `services/comments.service.ts`:

```typescript
import { api } from '@/lib/api';

export const commentsService = {
  async create(poemId: number, text: string) {
    const response = await api.post('/comments', { poemId, text });
    return response.data;
  },

  async getByPoem(poemId: number) {
    const response = await api.get(`/comments/poem/${poemId}`);
    return response.data;
  },

  async update(id: number, text: string) {
    const response = await api.put(`/comments/${id}`, { text });
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};
```

### 7. Создать Favorites сервис

Создайте файл `services/favorites.service.ts`:

```typescript
import { api } from '@/lib/api';

export const favoritesService = {
  async add(poemId: number) {
    const response = await api.post(`/favorites/${poemId}`);
    return response.data;
  },

  async remove(poemId: number) {
    const response = await api.delete(`/favorites/${poemId}`);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/favorites');
    return response.data;
  },

  async check(poemId: number) {
    const response = await api.get(`/favorites/check/${poemId}`);
    return response.data;
  },
};
```

## Примеры использования

### Регистрация

```typescript
'use client';
import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authService.register(email, password, name);
      console.log('Registration successful:', result);
      // Redirect to home or dashboard
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Register</button>
    </form>
  );
}
```

### Получение стихов коллекции

```typescript
'use client';
import { useEffect, useState } from 'react';
import { poemsService } from '@/services/poems.service';

export default function CollectionPage({ params }: { params: { id: string } }) {
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    const fetchPoems = async () => {
      try {
        const data = await poemsService.getByCollection(Number(params.id));
        setPoems(data);
      } catch (error) {
        console.error('Failed to fetch poems:', error);
      }
    };

    fetchPoems();
  }, [params.id]);

  return (
    <div>
      {poems.map((poem: any) => (
        <div key={poem.id}>
          <h3>{poem.title}</h3>
          <p>{poem.author}</p>
        </div>
      ))}
    </div>
  );
}
```

### Добавление в избранное

```typescript
'use client';
import { favoritesService } from '@/services/favorites.service';

export function FavoriteButton({ poemId }: { poemId: number }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoritesService.remove(poemId);
        setIsFavorited(false);
      } else {
        await favoritesService.add(poemId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  return (
    <button onClick={handleToggleFavorite}>
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
}
```

## Environment Variables

Добавьте в `.env.local` фронтенда:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## CORS

Backend уже настроен для работы с CORS и поддерживает credentials (cookies).

## TypeScript Types

Создайте файл `types/api.ts` с типами для API:

```typescript
export interface User {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface Poem {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: string;
  year: number | null;
  views: number;
  likes: number;
  collectionId: number;
  collection?: Collection;
  comments?: Comment[];
  isFavorited?: boolean;
  _count?: {
    comments: number;
    favorites: number;
  };
}

export interface Collection {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  categoryId: number;
  category?: Category;
  poems?: Poem[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  collections?: Collection[];
}

export interface Comment {
  id: number;
  text: string;
  userId: number;
  poemId: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  poemId: number;
  poem: Poem;
  createdAt: string;
}
```

---

Теперь ваш фронтенд готов к интеграции с backend! 🚀
