# 🏗️ Poetry Project Architecture

## 🎯 Project Overview

Full-stack поэтический веб-сайт с авторизацией, коллекциями стихов, комментариями и избранным.

## 📦 Tech Stack

### **Backend:**
- ✅ **NestJS** - REST API framework
- ✅ **Prisma 7** - ORM с PostgreSQL
- ✅ **JWT** - аутентификация через cookies
- ✅ **Bcrypt** - хеширование паролей
- ✅ **Class Validator** - валидация DTO

### **Frontend:**
- ✅ **Next.js 15** - App Router
- ✅ **React 19** - UI library
- ✅ **TypeScript** - типизация
- ✅ **React Query** - data fetching
- ✅ **Zustand** - state management
- ✅ **Zod** - валидация схем
- ✅ **React Hook Form** - формы
- ✅ **Axios** - HTTP клиент
- ✅ **Framer Motion** - анимации
- ✅ **CSS Modules** - стилизация

## 📁 Frontend Architecture (FSD)

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with Providers
│   ├── providers.tsx          # React Query Provider
│   └── page.tsx               # Home page
│
├── entities/                   # Business entities
│   └── user/
│       ├── user.store.ts      # Zustand store
│       └── index.ts
│
├── features/                   # Application features
│   └── auth/                  # ✅ Authentication
│       ├── sign-in/
│       │   ├── model/
│       │   │   └── use-sign-in.ts
│       │   └── ui/
│       │       ├── sign-in-form.tsx
│       │       └── sign-in-form.module.css
│       ├── sign-up/
│       │   ├── model/
│       │   │   └── use-sign-up.ts
│       │   └── ui/
│       │       ├── sign-up-form.tsx
│       │       └── sign-up-form.module.css
│       ├── ui/
│       │   ├── auth-input.tsx
│       │   └── auth-input.module.css
│       └── index.ts
│
└── shared/                     # Shared resources
    ├── api/                   # ✅ API clients
    │   ├── client.ts          # Axios instance
    │   ├── auth.api.ts
    │   ├── poems.api.ts
    │   ├── collections.api.ts
    │   ├── categories.api.ts
    │   ├── comments.api.ts
    │   ├── favorites.api.ts
    │   └── index.ts
    │
    ├── types/                 # ✅ TypeScript types
    │   ├── auth.types.ts
    │   ├── poem.types.ts
    │   ├── collection.types.ts
    │   ├── category.types.ts
    │   ├── comment.types.ts
    │   ├── favorite.types.ts
    │   └── index.ts
    │
    ├── lib/                   # ✅ Utilities
    │   ├── validations/
    │   │   ├── auth.schema.ts
    │   │   ├── comment.schema.ts
    │   │   ├── profile.schema.ts
    │   │   └── index.ts
    │   └── index.ts
    │
    ├── hooks/                 # ✅ React hooks
    │   ├── use-auth.ts
    │   ├── use-poems.ts
    │   ├── use-comments.ts
    │   └── index.ts
    │
    ├── config/                # ✅ Configuration
    │   └── query-client.ts
    │
    └── index.ts
```

## 🔄 Data Flow

### **Authentication Flow:**

```
1. User fills form → SignInForm/SignUpForm
2. Form validates with Zod → loginSchema/registerSchema
3. useSignIn/useSignUp hook → authApi.login/register
4. API calls backend → POST /auth/login or /auth/register
5. Backend returns user + JWT (httpOnly cookie)
6. Frontend saves user → Zustand store (useUserStore)
7. Zustand persists → localStorage
8. Header reads → useUserStore() → shows profile
```

### **Data Fetching Flow:**

```
1. Component mounts → usePoems() hook
2. React Query checks cache
3. If stale → poemsApi.getAll()
4. Axios adds JWT token (interceptor)
5. Backend validates token → returns data
6. React Query updates cache
7. Component re-renders with data
```

## 🔐 Authentication

### **JWT Storage:**
- ✅ **httpOnly cookies** - для безопасности (backend sets)
- ✅ **localStorage** - user data (Zustand persist)

### **Axios Interceptors:**
```typescript
// Request interceptor - adds token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handles 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

## 📊 State Management

### **Zustand Store:**
```typescript
useUserStore()
├── user: User | null
├── isAuthenticated: boolean
├── setUser(user)
└── logout()
```

### **React Query Cache:**
```typescript
queryClient
├── ['poems', page, limit]      # Poems list
├── ['poem', id]                 # Single poem
├── ['comments', poemId]         # Comments
├── ['favorites']                # User favorites
└── ['categories']               # Categories
```

## 🎨 Component Structure

### **Feature Component Pattern:**
```
feature/
├── model/           # Business logic (hooks, stores)
├── ui/              # UI components
└── index.ts         # Public API
```

### **Example:**
```typescript
// ✅ Good: Clean separation
src/features/auth/
├── sign-in/
│   ├── model/use-sign-in.ts       # Hook with mutation
│   └── ui/sign-in-form.tsx         # UI with form
└── index.ts                        # export { SignInForm }

// ❌ Bad: Mixed concerns
components/SignInForm.tsx           # Logic + UI in one file
```

## 🚀 Running the Project

### **Backend:**
```bash
cd poetry-backend
npm run start:dev  # Port 3001
```

### **Frontend:**
```bash
npm run dev        # Port 3000
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/profile` | Get current user |
| GET | `/poems` | Get poems (paginated) |
| GET | `/poems/:id` | Get single poem |
| GET | `/collections` | Get collections |
| GET | `/categories` | Get categories |
| POST | `/comments` | Create comment |
| POST | `/favorites/:poemId` | Add to favorites |

## 📝 Code Style

### **Naming Conventions:**
- **Components:** PascalCase (`SignInForm`, `AuthInput`)
- **Hooks:** camelCase with `use` prefix (`useSignIn`, `usePoems`)
- **API:** camelCase with `api` suffix (`authApi`, `poemsApi`)
- **Types:** PascalCase (`User`, `Poem`, `LoginDto`)
- **CSS Modules:** camelCase (`.submitButton`, `.formError`)

### **File Naming:**
- **Components:** `sign-in-form.tsx`
- **Hooks:** `use-sign-in.ts`
- **Types:** `auth.types.ts`
- **API:** `auth.api.ts`
- **Styles:** `sign-in-form.module.css`

## ✅ Completed Features

- ✅ Backend API (NestJS + Prisma 7)
- ✅ Database schema (PostgreSQL)
- ✅ JWT authentication
- ✅ Frontend architecture (FSD)
- ✅ API clients (Axios)
- ✅ State management (Zustand)
- ✅ Data fetching (React Query)
- ✅ Form validation (Zod)
- ✅ Auth feature (SignIn/SignUp)
- ✅ Header integration

## 🎯 Next Steps

1. **Create features/poems** - poem display components
2. **Create features/comments** - comment system
3. **Create shared/ui** - reusable UI components
4. **Integrate existing components** with API
5. **Add loading states** and error handling
6. **Implement favorites** functionality
7. **Add search** feature

---

**Architecture by FSD principles** 🏗️
**Full-stack with TypeScript** 💎
**Production-ready** 🚀
