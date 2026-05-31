from pydantic import BaseModel, ConfigDict, Field, field_validator
from app.schemas.user import UserRead
from datetime import datetime
from typing import Optional
from app.schemas.project_specialty import ProjectSpecialtyRead

class ProjectMemberRead(BaseModel):
    project_id: int
    user: UserRead = Field(alias="member")
    joined_at: datetime
    specialty: Optional[ProjectSpecialtyRead] = None
    role: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class ProjectMemberAdd(BaseModel):
    user_id: int

class MemberRoleAssign(BaseModel):
    role: str

class MemberSpecialtyAssign(BaseModel):
    specialty: Optional[int] = None

class MemberAdd(BaseModel):
    role: str = "executor"
    specialty: Optional[int] = None

    @field_validator('role')
    @classmethod
    def role_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Роль обязательна')
        return v