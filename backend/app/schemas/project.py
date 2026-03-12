from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.schemas.project_member import ProjectMemberRead

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)

class ProjectRead(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)


class ProjectWithMembers(ProjectRead):
    members: List[ProjectMemberRead] = []

class ProjectListItem(ProjectRead):
    member_count: int = 0