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

## Структура компонента
```
ComponentName/
├── index.ts
├── ComponentName.tsx
└── style.module.css
```
### index.ts
тут мы прописываем импорт компонента по default
```tsx
export { default } from './ComponentName.tsx'
```
Так же типы и статические данные которые экспортируются во вне компонента и функции
```tsx
export interface ComponentTypes {...}

export const COMPONENT_DATA = ...

export function componentFn () {...}
```

### ComponentName.tsx 
Тут описывает структуру компонента и логику

```tsx
const ComponentName = () = {
  function someFn () {...}

  return (
    ...
  )
}

export default ComponentName;
```

### style.module.css
тут описывает стили компонента в классическом css синтаксисе, название могут повторяться относительно других компонентов, но конфликтовать они не будут из за изоляции внутри компонента

```css
.root {
    position: absolute;
    top: 0;
    left: 0;
    
    width: 100%;
    height: 100%;
    
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;

    font-size: 14px;
    line-height: 22px;
    color: tomato;
}
```

Желательно делить стили отступом на логичные блоки например позиционирование / шрифты / цвета / сетка / размеры ( как в примере выше )

## Fetch запросы
Для запросов используется обертка useApi(), у которой есть методы post, get, put, delete
```js
const api = useApi()

api.{ метод }('{url запроса}', { тело запроса (опционально )})

// Пример

api.post('/users/login', {name: 'user', password: '1234'})
```
Так же не забываем оборачивать в try catch
```js
// Пример
const api = useApi()
try {
    await api.post('/users/login', {name: 'user', password: '1234'})
} catch (e) {
    // логика обработки ошибок
}
```

## Модальный Alert 
Компонент для оповещения юзера о ошибки или успехе операции - AlertModal, внутри себя содержит алерт material UI. Дефолтные настройки duration - 2 секунды, то есть через 2 секунды окно само пропадает, title - опционально, message - обязательно, type - "error" | "warning" | "info" | "success"
```tsx
// Вызов из функции
  const { showAlertModal } = useAlertModal()

  showAlertModal({ title: 'Ошибка', message })
```