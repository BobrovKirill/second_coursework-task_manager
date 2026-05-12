from pydantic import BaseModel, Field, ConfigDict, field_validator
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
    icon_url: Optional[str] = Field(None, max_length=500)
    font_color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    background_type: Optional[str] = Field(None, pattern="^(default|color|gradient|image)$")
    background_value: Optional[str] = None

class ProjectRead(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    is_active: bool
    icon_url: Optional[str] = None
    font_color: Optional[str] = "#000000"
    background_type: str = "default"
    background_value: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ProjectWithMembers(ProjectRead):
    members: List[ProjectMemberRead] = []

class ProjectListItem(ProjectRead):
    member_count: int = 0