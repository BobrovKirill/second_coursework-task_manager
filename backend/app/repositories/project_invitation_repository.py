from datetime import datetime
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project_invitation import ProjectInvitation


class ProjectInvitationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        project_id: int,
        invited_by_id: int,
        email: str,
        role: str,
        specialty_id: Optional[int],
        token_hash: str,
        expires_at: datetime,
    ) -> ProjectInvitation:
        invitation = ProjectInvitation(
            project_id=project_id,
            invited_by_id=invited_by_id,
            email=email,
            role=role,
            specialty_id=specialty_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(invitation)
        await self.db.commit()
        await self.db.refresh(invitation)
        return invitation

    async def expire_pending_for_email(self, project_id: int, email: str) -> None:
        await self.db.execute(
            update(ProjectInvitation)
            .where(
                ProjectInvitation.project_id == project_id,
                ProjectInvitation.email == email,
                ProjectInvitation.used_at.is_(None),
            )
            .values(used_at=datetime.utcnow())
        )
        await self.db.commit()

    async def get_active_by_token_hash(self, token_hash: str) -> Optional[ProjectInvitation]:
        result = await self.db.execute(
            select(ProjectInvitation).where(
                ProjectInvitation.token_hash == token_hash,
                ProjectInvitation.used_at.is_(None),
                ProjectInvitation.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def mark_used(self, invitation: ProjectInvitation) -> ProjectInvitation:
        invitation.used_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(invitation)
        return invitation
