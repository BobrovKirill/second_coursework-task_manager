from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserRead
from datetime import datetime
from typing import Optional
from app.schemas.project_specialty import ProjectSpecialtyRead

class ProjectMemberRead(BaseModel):
    project_id: int
    user: UserRead = Field(alias="member")
    joined_at: datetime
    specialty: Optional[ProjectSpecialtyRead] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class ProjectMemberAdd(BaseModel):
    user_id: int

class MemberRoleAssign(BaseModel):
    role_name: str

class ProjectMemberWithSpecialty(BaseModel):
    id: int
    username: str
    email: str
    specialty_id: Optional[int] = None
    specialty_name: Optional[str] = None
    specialty_hex_color: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)