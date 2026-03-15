from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from humps import camelize
from pydantic import field_validator

# Валидация и типы для user'a
# Общие поля
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    is_active: bool = True
    is_superuser: bool = False

    model_config = ConfigDict(
        alias_generator=camelize,
        populate_by_name=True,
        from_attributes=True
    )


# Схема для создания, наследуюем общий класс
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    model_config = ConfigDict(
        extra="forbid",
        alias_generator=camelize,
        populate_by_name=True,
        from_attributes=True
    )


# Схема для обновления, наследуюем общий класс
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: str | None = Field(None, min_length=3, max_length=50)
    password: str | None = Field(None, min_length=8, max_length=100)
    is_active: bool | None = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    patronymic: Optional[str] = Field(None, max_length=100)
    birth_date: Optional[datetime] = None
    position: Optional[str] = Field(None, max_length=255)
    employee_type: Optional[str] = Field(None, max_length=50)
    avatar: Optional[str] = Field(None, max_length=500)

    # Валидируем дату рождения, что если с фронта пришла пустая строка то записываем ее как null
    @field_validator('birth_date', mode='before')
    @classmethod
    def empty_string_to_none(cls, value):
        if value == '':
            return None
        return value

    model_config = ConfigDict(
        extra = "forbid",
        # мутируем значение с фронта с camelCase в snake_case
        alias_generator=camelize,
        populate_by_name=True,
        from_attributes=True
    )


# Схема для ответа (без пароля), наследуюем общий класс
class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    patronymic: Optional[str] = None
    birth_date: Optional[datetime] = None
    position: Optional[str] = None
    employee_type: Optional[str] = None
    avatar: Optional[str] = None

    model_config = ConfigDict(
        alias_generator=camelize,
        populate_by_name=True,
        from_attributes=True
    )