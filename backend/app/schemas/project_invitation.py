from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional


class ProjectInvitationCreate(BaseModel):
    email: EmailStr
    role: str = "executor"
    specialty: Optional[int] = None

    @field_validator("role")
    @classmethod
    def role_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Роль обязательна")
        return value


class ProjectInvitationAccept(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=100)
    confirm: str = Field(..., min_length=8, max_length=100)

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm:
            raise ValueError("Пароли не совпадают")
        return self
