# Fast Api + Pydantic + PostgreSQL + Alembic + Python-dotenv

## Установка зависимостей и запуск
Version: python 3.9

Установка: список зависимостей содержиться в requirements.txt
```bash
pip install -r requirements.txt # устанавливаем зависимости
```

Запуск:
```bash
uvicorn app.main:app --reload # запуск fast api сервера
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

## Doker
База данных вынесена в докер контейнер, для запуска, из корня проекта (не из /backend)
```bash
docker-compose up -d db # запускаем контейнер
```

## Миграции
На проекте используется alembic
### Начало работы и пошаговый алгоритм действий 
```bash
git pull # подтягиваем изменения
alembic upgrade head # принимаем миграцию коллеги
```
После внесения изменения в структуру БД, выполняем миграцию и push'им
```bash
alembic revision --autogenerate -m "описание изменений" # коммитим изменения БД
```
далее
```bash
alembic upgrade head # принимаем миграцию коллеги
```

### Особености 
локальный PostgreSQL может кофликтовать с портом с докером на порту 5432, для этого его надо оставить (особеность на мак, но если может пригодиться и для других ОС)
```bash
brew services stop postgresql@14
```

### Endpoints
С помощью библиотеки humps, решаем небольшой конфликт между беком и фронтом а именно -
• Так как на фронте стандарт нейминга camelCase а на беке snake_case то поинта логично срабатывают не так как надо firstName не записывается в first_name
• Я подумал что логичнее этот момент нагрузить на сторону бека, чтоб минимизировать количество js'а на фронте
• Плюс библиотеки что надо в schema добавить всего один параметр в ConfigDict, примериблиотеку humps для бека, для того чтоб решить небольшой конфликт между беком и фронтом а именно -
• Так как на фронте стандарт нейминга camelCase а на беке snake_case то поинта логично срабатывают не так как надо firstName не записывается в first_name
• Я подумал что логичнее этот момент нагрузить на сторону бека, чтоб минимизировать количество js'а на фронте
• Плюс библиотеки что надо в schema добавить всего один параметр в ConfigDict, пример
```python
from humps import camelize


model_config = ConfigDict(
extra="forbid",
alias_generator=camelize, // <- эту строку и все
populate_by_name=True,
from_attributes=True
)
```