# Poetry - Next.js веб-сайт стихов

Современный веб-сайт для публикации и чтения стихотворений на Next.js + React + TypeScript.

## 🎨 Структура проекта (FSD)

```
poetry/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Главная страница
│   └── globals.css              # Глобальные стили
│
├── components/                   # React компоненты
│   ├── Header/
│   │   ├── Header.tsx           # Компонент хедера
│   │   └── Header.module.css    # Стили хедера
│   └── Hero/
│       ├── Hero.tsx             # Компонент hero-секции
│       └── Hero.module.css      # Стили hero-секции
│
├── package.json                 # Зависимости
├── tsconfig.json                # TypeScript конфиг
├── next.config.js               # Next.js конфиг
└── README.md                    # Документация
```

## 🚀 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 3. Сборка для продакшена

```bash
npm run build
npm start
```

## ✨ Технологии

- ⚡ **Next.js 14** - React фреймворк
- ⚛️ **React 18** - UI библиотека
- 📘 **TypeScript** - Типизация
- 🎨 **CSS Modules** - Модульные стили
- 🔥 **App Router** - Новый роутинг Next.js

## 📦 Компоненты

### Header
- Sticky навигация
- Responsive меню
- Эффект при скролле
- Next.js Link для навигации

### Hero
- Главная секция
- Категории стихов
- CTA кнопка
- Анимации и градиенты

## 🎯 Особенности

- 🚀 Server-Side Rendering (SSR)
- ⚡ Быстрая навигация с Next.js
- 📱 Полностью адаптивный дизайн
- 🎨 CSS Modules для изоляции стилей
- ♿ Семантичная разметка
- 🔍 SEO оптимизация
- 💅 Плавные анимации

## 🎨 Цветовая схема

```css
--primary-color: #2c2c2c
--secondary-color: #6b6b6b
--accent-color: #8b8b8b
--light-bg: #f5f5f5
--white: #ffffff
```

## 📝 Разделы сайта

- **Главная** (`/`) - Приветственная страница
- **Направления** (`#directions`) - Жанры и стили
- **Стихи** (`/poems`) - Каталог стихотворений
- **О нас** (`/about`) - Информация о проекте
- **Авторы** (`/authors`) - Список поэтов
- **Контакты** (`/contact`) - Связь
- **Войти** (`/login`) - Авторизация

## 🛠️ Дальнейшее развитие

- [ ] Создать страницы `/poems`, `/about`, `/authors`
- [ ] Добавить API роуты
- [ ] Интеграция с базой данных
- [ ] Система авторизации (NextAuth.js)
- [ ] Профили авторов
- [ ] Поиск и фильтрация стихов
- [ ] Избранное
- [ ] Комментарии и рейтинги
- [ ] Admin панель
- [ ] Markdown редактор для стихов

## 📚 Команды

```bash
npm run dev      # Запуск dev сервера
npm run build    # Сборка проекта
npm start        # Запуск продакшен сервера
npm run lint     # Проверка линтером
```

## 🌟 Best Practices

- ✅ TypeScript для типобезопасности
- ✅ CSS Modules для изоляции стилей
- ✅ 'use client' только где нужна интерактивность
- ✅ Next.js Image для оптимизации изображений
- ✅ Metadata API для SEO
- ✅ App Router для современного роутинга
