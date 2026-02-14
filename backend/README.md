# Fast Api + Pydantic + PostgreSQL + Alembic + Python-dotenv

## Установка зависимостей и запуск
Version: python 3.9

Установка: список зависимостей содержиться в requirements.txt
```
pip install -r requirements.txt
```

Запуск:
```
uvicorn app.main:app --reload
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
└── vite-env.d.ts    # Типы Vite
```