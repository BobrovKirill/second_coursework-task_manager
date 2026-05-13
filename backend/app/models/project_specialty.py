from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String
from app.core.database import Base

class ProjectSpecialty(Base):
    __tablename__ = "project_specialties"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False
    )
    name: Mapped[str] = mapped_column(String(70), nullable=False)
    hex_color: Mapped[str] = mapped_column(String(7), nullable=False)
    
    project: Mapped["Project"] = relationship(back_populates="specialties")
    members: Mapped[list["ProjectMember"]] = relationship(
        back_populates="specialty",
        foreign_keys="ProjectMember.specialty_id"
    )