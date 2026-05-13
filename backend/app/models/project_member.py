from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, func
from datetime import datetime
from typing import Optional
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
    specialty_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("project_specialties.id", ondelete="SET NULL"),
        nullable=True
    )
    
    project: Mapped["Project"] = relationship(back_populates="members")
    member: Mapped["User"] = relationship(back_populates="project_memberships")
    specialty: Mapped[Optional["ProjectSpecialty"]] = relationship(
        back_populates="members",
        foreign_keys=[specialty_id]
    )

# Класс Role соответсвует одной таблице в БД и содержит в себе:
# project_id — первичный ключ
# user_id — id юзеров
# role_id — id ролей
# role — роли
class ProjectMemberRole(Base):
    __tablename__ = "project_member_roles"

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)

    role: Mapped["Role"] = relationship(back_populates="member_roles")