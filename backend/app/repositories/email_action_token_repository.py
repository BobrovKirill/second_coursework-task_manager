from datetime import datetime
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_action_token import EmailActionToken


class EmailActionTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: int,
        purpose: str,
        token_hash: str,
        expires_at: datetime,
    ) -> EmailActionToken:
        token = EmailActionToken(
            user_id=user_id,
            purpose=purpose,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(token)
        await self.db.commit()
        await self.db.refresh(token)
        return token

    async def expire_user_tokens(self, user_id: int, purpose: str) -> None:
        await self.db.execute(
            update(EmailActionToken)
            .where(
                EmailActionToken.user_id == user_id,
                EmailActionToken.purpose == purpose,
                EmailActionToken.used_at.is_(None),
            )
            .values(used_at=datetime.utcnow())
        )
        await self.db.commit()

    async def get_active_token(
        self,
        token_hash: str,
        purpose: str,
    ) -> Optional[EmailActionToken]:
        result = await self.db.execute(
            select(EmailActionToken).where(
                EmailActionToken.token_hash == token_hash,
                EmailActionToken.purpose == purpose,
                EmailActionToken.used_at.is_(None),
                EmailActionToken.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def mark_used(self, token: EmailActionToken) -> EmailActionToken:
        token.used_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(token)
        return token
