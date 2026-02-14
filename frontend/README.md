# React + TypeScript + Vite + Material UI 

## Установка зависимостей и запуск
Version: Node.js 22 и выше 

Установка:
```
npm install
```

Запуск:
```
npm run dev
```

## Структура проекта

```
src/
├── components/       # Переиспользуемые UI компоненты
├── pages/           # Компоненты страниц (роутинг)
├── services/        # API клиенты, HTTP запросы
├── hooks/           # Кастомные React хуки
├── store/           # Глобальное состояние (zustand)
├── utils/           # Утилитарные функции
├── types/           # TypeScript типы и интерфейсы
├── constants/       # Константы приложения
├── styles/          # Глобальные стили, темы MUI
├── assets/          # Изображения, иконки, шрифты
├── App.tsx          # Корневой компонент
├── main.tsx         # Точка входа
├── eslint.config    # Конфиг файл линтера
├── package.json     # Зависимости и скрипты запуска
└── vite-env.d.ts    # Типы Vite
```