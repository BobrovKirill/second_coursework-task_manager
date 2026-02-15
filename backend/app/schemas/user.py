from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

# Валидация и типы для user'a
# Общие поля
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    is_active: bool = True
    is_superuser: bool = False


# Схема для создания, наследуюем общий класс
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


# Схема для обновления, наследуюем общий класс
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    username: str | None = Field(None, min_length=3, max_length=50)
    password: str | None = Field(None, min_length=8, max_length=100)
    is_active: bool | None = None


# Схема для ответа (без пароля), наследуюем общий класс
class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)