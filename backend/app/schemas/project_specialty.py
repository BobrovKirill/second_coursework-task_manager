from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ProjectSpecialtyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=70)
    hex_color: str = Field(..., pattern="^#[0-9a-fA-F]{6}$")

class ProjectSpecialtyCreate(ProjectSpecialtyBase):
    pass

class ProjectSpecialtyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=70)
    hex_color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")

class ProjectSpecialtyRead(ProjectSpecialtyBase):
    id: int
    project_id: int
    
    model_config = ConfigDict(from_attributes=True)

class MemberSpecialtyAssign(BaseModel):
    specialty_id: Optional[int] = None