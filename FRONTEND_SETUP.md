# 🎨 Frontend Architecture - Poetry Project

## 📁 FSD (Feature-Sliced Design) Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Providers
│   ├── providers.tsx      # React Query, Zustand providers
│   └── ...pages/          # Route pages
│
├── entities/              # Business entities
│   └── user/
│       └── user.store.ts  # Zustand user state
│
├── features/              # Application features
│   ├── auth/             # Authentication (будем создавать)
│   ├── poems/            # Poems management
│   └── comments/         # Comments system
│
└── shared/                # Shared resources
    ├── api/              # API clients
    │   ├── client.ts     # Axios instance
    │   ├── auth.api.ts
    │   ├── poems.api.ts
    │   └── ...
    │
    ├── types/            # TypeScript types
    │   ├── auth.types.ts
    │   ├── poem.types.ts
    │   └── ...
    │
    ├── lib/              # Utilities & validations
    │   └── validations/
    │       ├── auth.schema.ts    # Zod schemas
    │       └── ...
    │
    ├── hooks/            # React hooks
    │   ├── use-auth.ts
    │   ├── use-poems.ts
    │   └── ...
    │
    ├── config/           # Configuration
    │   └── query-client.ts
    │
    └── ui/               # Shared UI components
```

## 🔥 Installed Libraries

### **State Management:**
- ✅ **Zustand** (v5.0.5) - легковесный state management
- ✅ **Zustand Persist** - сохранение состояния в localStorage

### **Data Fetching:**
- ✅ **React Query** (@tanstack/react-query v5.79.0)
- ✅ **React Query Devtools** - отладка запросов

### **Forms & Validation:**
- ✅ **React Hook Form** (v7.57.0) - управление формами
- ✅ **Zod** (v3.25.64) - схемы валидации
- ✅ **@hookform/resolvers** - интеграция Zod с React Hook Form

### **HTTP Client:**
- ✅ **Axios** (v1.9.0) - HTTP requests

### **Animations:**
- ✅ **Framer Motion** (v12.23.24) - анимации

## 🚀 Quick Start

### 1. Environment Variables

Создан файл `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Start Backend

```bash
cd poetry-backend
npm run start:dev  # Должен быть на порту 3001
```

### 3. Start Frontend

```bash
npm run dev  # Запустится на порту 3000
```

## 📝 Usage Examples

### **1. Authentication Hook**

```typescript
import { useAuth } from '@/shared/hooks';

function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (data) => {
    try {
      await login(data);
      // User automatically saved to Zustand store
    } catch (error) {
      console.error(error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### **2. Fetch Poems with React Query**

```typescript
import { usePoems } from '@/shared/hooks';

function PoemsList() {
  const { data, isLoading, error } = usePoems(1, 20);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.poems.map((poem) => (
        <div key={poem.id}>{poem.title}</div>
      ))}
    </div>
  );
}
```

### **3. Form with Zod Validation**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/shared/lib/validations';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### **4. Zustand Store**

```typescript
import { useUserStore } from '@/entities/user/user.store';

function Header() {
  const { user, isAuthenticated, logout } = useUserStore();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      <span>Welcome, {user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🛠️ API Client Features

### **Auto Token Management:**
- ✅ Автоматически добавляет JWT token в headers
- ✅ Сохраняет токены в localStorage
- ✅ Обрабатывает 401 ошибки (redirect на login)

### **Cookie Support:**
- ✅ `withCredentials: true` для httpOnly cookies
- ✅ CORS настроен на backend

## 📚 Next Steps

1. **Создать features/auth** - компоненты авторизации
2. **Создать features/poems** - компоненты стихов
3. **Создать shared/ui** - переиспользуемые компоненты
4. **Интегрировать существующие компоненты** с API

## 🔗 Documentation Links

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Zod Docs](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Ready to code!** 🚀
