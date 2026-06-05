from __future__ import annotations

import re
from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        user = await self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def count(self) -> int:
        result = await self.db.execute(select(func.count(User.id)))
        return result.scalar_one()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        result = await self.db.execute(select(User).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hash_password(user_data.password),
            is_active=user_data.is_active,
            is_superuser=user_data.is_superuser
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_invited_user(self, email: str, password: str) -> User:
        user = User(
            email=email,
            username=await self._generate_username(email),
            hashed_password=hash_password(password),
            is_active=True,
            is_superuser=False,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update(self, user: User, user_data: UserUpdate) -> User:
        update_data = user_data.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = hash_password(update_data.pop("password"))
        for field, value in update_data.items():
            setattr(user, field, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def set_active(self, user: User, is_active: bool) -> User:
        user.is_active = is_active
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def set_password(self, user: User, password: str) -> User:
        user.hashed_password = hash_password(password)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user: User) -> None:
        await self.db.delete(user)
        await self.db.commit()

    async def search(self, email: Optional[str] = None, full_name: Optional[str] = None, limit: int = 10) -> list[User]:
        conditions = []

        if email:
            conditions.append(User.email.ilike(f"%{email}%"))

        if full_name:
            parts = full_name.strip().split()
            for part in parts:
                conditions.append(
                    or_(
                        User.first_name.ilike(f"%{part}%"),
                        User.last_name.ilike(f"%{part}%"),
                        User.patronymic.ilike(f"%{part}%"),
                    )
                )

        if not conditions:
            return []

        result = await self.db.execute(
            select(User).where(or_(*conditions)).limit(limit)
        )
        return list(result.scalars().all())

    async def _generate_username(self, email: str) -> str:
        local_part = email.split("@", 1)[0].lower()
        base_username = re.sub(r"[^a-z0-9_]+", "_", local_part).strip("_")

        if len(base_username) < 3:
            base_username = "user"

        username = base_username[:50]
        counter = 1

        while await self.get_by_username(username):
            suffix = f"_{counter}"
            username = f"{base_username[:50 - len(suffix)]}{suffix}"
            counter += 1

        return username
