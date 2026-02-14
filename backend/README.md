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
my_project/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── users.py          # эндпоинты пользователей
│   ├── core/
│   │   ├── config.py             # настройки (настройки из .env, pydantic Settings)
│   │   └── database.py           # engine, SessionLocal, get_db, Base
│   ├── models/
│   │   └── user.py               # SQLAlchemy модели (User, возможно другие)
│   ├── schemas/
│   │   └── user.py               # Pydantic схемы (UserBase, UserCreate, UserRead, UserUpdate и т.д.)
│   ├── services/
│   │   └── user_service.py       # бизнес-логика (часто называют service layer)
│   ├── repositories/
│   │   ├── user_repository.py    # CRUD-операции с пользователями
│   │   └── product_repository.py # CRUD-операции с продуктами (пример другого репозитория)
│   └── main.py                   # точка входа, создание FastAPI приложения, подключение роутеров
├── tests/                        # тесты (pytest)
├── migrations/                   # alembic миграции
├── requirements.txt              # зависимости проекта
└── Dockerfile                    # для контейнеризации
```