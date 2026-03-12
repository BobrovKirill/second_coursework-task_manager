from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserRead
from datetime import datetime

class ProjectMemberRead(BaseModel):
    project_id: int
    user: UserRead = Field(alias="member")
    joined_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True
    )

class ProjectMemberAdd(BaseModel):
    user_id: int