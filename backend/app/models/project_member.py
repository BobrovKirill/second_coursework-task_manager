from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, func
from datetime import datetime
from app.core.database import Base

class ProjectMember(Base):
    __tablename__ = "project_members"
    
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), 
        primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True
    )
    joined_at: Mapped[datetime] = mapped_column( 
        server_default=func.timezone('UTC', func.now())
    )
    project: Mapped["Project"] = relationship(back_populates="members")
    member: Mapped["User"] = relationship(back_populates="project_memberships")