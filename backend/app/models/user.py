from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.core.database import Base

# Класс User соответсвует одной таблице в БД и содержит в себе:
# String(255) — VARCHAR(255) в SQL (строка до 255 символов)
# unique=True — в БД не может быть двух одинаковых сущностей (к примеру email, username)
# index=True — индекс для быстрого поиска
# nullable=False — поле обязательное (NOT NULL в SQL)
# Boolean — BOOLEAN в SQL (true/false)
# default=True — при создании пользователя по умолчанию активен
# is_superuser — является ли юзер админом
# default=datetime.utcnow — при создании записи = текущее время
# onupdate=datetime.utcnow — при UPDATE обновляется на текущее время
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)