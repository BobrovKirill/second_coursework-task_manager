from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import List
from app.core.database import Base
from typing import Optional

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
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    patronymic: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    position: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    employee_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # связи с проектом и участниками проекта
    owned_projects: Mapped[List["Project"]] = relationship(
        back_populates="owner", 
        foreign_keys="Project.owner_id"
    )
    project_memberships: Mapped[List["ProjectMember"]] = relationship(
        back_populates="member"
    )
    
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="author",
        cascade="all, delete-orphan",
    )