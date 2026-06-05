# Курсовая работа стундентов второго курса ВШЭ

## На тему - Таск менеджер

## Разработчики:

 - Валиев Арслан
 - Болучевская Ксения
 - Бобров Кирилл

## Стенк:
 - Фронтенд - React + Material UI + Vite + TS
 - Бекенд - Fast Api + Pydantic + PostgreSQL + Alembic + SQLAlchemy

## Локальная инфраструктура

Для запуска локальных сервисов используется Docker Compose:

```bash
docker compose up -d
```

### PostgreSQL

- Хост: `localhost`
- Порт: `5432`
- База данных: `task_manager_canary`
- Пользователь: `postgres_team`

### MinIO

MinIO используется как локальное S3-хранилище для файлов проекта.

- S3 endpoint: `http://localhost:9000`
- Web UI: `http://localhost:9001`
- Логин: `minioadmin`
- Пароль: `minioadmin123`
- Bucket: `task-manager`

После запуска `docker compose up -d` bucket `task-manager` создается автоматически сервисом `minio-setup`.

### Mailpit

Mailpit используется для локальной проверки писем. Письма не отправляются наружу, а попадают в локальный web-интерфейс.

- SMTP: `localhost:1025`
- Web UI: `http://localhost:8025`
