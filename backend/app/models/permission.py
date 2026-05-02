from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Text
from app.core.database import Base

# Класс Role соответсвует одной таблице в БД и содержит в себе:
# id — первичный ключ
# name — название разрешения
# description — описание разрешения
# roles — роли
class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)

    roles: Mapped[list["RolePermission"]] = relationship(back_populates="permission")