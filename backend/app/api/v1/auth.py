from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from urllib.parse import urlencode

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, generate_action_token, hash_action_token
from app.repositories.email_action_token_repository import EmailActionTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.token import (
    EmailVerificationRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    TokenResponse,
)
from app.schemas.project_invitation import ProjectInvitationAccept
from app.services.email_service import EmailDeliveryError, EmailService
from app.services.project_invitation_service import ProjectInvitationService
from app.services.user_service import EMAIL_VERIFICATION_PURPOSE

router = APIRouter(prefix="/auth", tags=["auth"])

PASSWORD_RESET_PURPOSE = "reset_password"
PASSWORD_RESET_REQUEST_MESSAGE = "Если email зарегистрирован, на него отправлена ссылка для восстановления пароля"


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    repository = UserRepository(db)
    user = await repository.authenticate(credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь неактивен"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.post("/verify-email", response_model=MessageResponse)
async def verify_email(
    data: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    token_repository = EmailActionTokenRepository(db)
    user_repository = UserRepository(db)

    email_token = await token_repository.get_active_token(
        token_hash=hash_action_token(data.token),
        purpose=EMAIL_VERIFICATION_PURPOSE,
    )

    if not email_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка подтверждения недействительна или устарела"
        )

    user = await user_repository.get_by_id(email_token.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка подтверждения недействительна или устарела"
        )

    if not user.is_active:
        await user_repository.set_active(user, True)

    await token_repository.mark_used(email_token)

    return MessageResponse(message="Email подтвержден")


@router.post("/password-reset/request", response_model=MessageResponse)
async def request_password_reset(
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    user_repository = UserRepository(db)
    token_repository = EmailActionTokenRepository(db)
    email_service = EmailService()

    user = await user_repository.get_by_email(data.email)
    if not user or not user.is_active:
        return MessageResponse(message=PASSWORD_RESET_REQUEST_MESSAGE)

    await token_repository.expire_user_tokens(
        user_id=user.id,
        purpose=PASSWORD_RESET_PURPOSE,
    )

    token = generate_action_token()
    await token_repository.create(
        user_id=user.id,
        purpose=PASSWORD_RESET_PURPOSE,
        token_hash=hash_action_token(token),
        expires_at=datetime.utcnow() + timedelta(
            minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
        ),
    )

    try:
        email_service.send_password_reset(
            to_email=user.email,
            reset_url=build_password_reset_url(token),
        )
    except EmailDeliveryError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Не удалось отправить письмо восстановления. Проверьте, что Mailpit запущен",
        )

    return MessageResponse(message=PASSWORD_RESET_REQUEST_MESSAGE)


@router.post("/password-reset/confirm", response_model=MessageResponse)
async def confirm_password_reset(
    data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    token_repository = EmailActionTokenRepository(db)
    user_repository = UserRepository(db)

    password_reset_token = await token_repository.get_active_token(
        token_hash=hash_action_token(data.token),
        purpose=PASSWORD_RESET_PURPOSE,
    )

    if not password_reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка восстановления пароля недействительна или устарела"
        )

    user = await user_repository.get_by_id(password_reset_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ссылка восстановления пароля недействительна или устарела"
        )

    await user_repository.set_password(user, data.password)
    await token_repository.mark_used(password_reset_token)

    return MessageResponse(message="Пароль обновлен")


def build_password_reset_url(token: str) -> str:
    query = urlencode({"token": token})
    return f"{settings.FRONTEND_URL.rstrip('/')}/auth/reset-password?{query}"


@router.post("/project-invitations/accept", response_model=MessageResponse)
async def accept_project_invitation(
    data: ProjectInvitationAccept,
    db: AsyncSession = Depends(get_db)
):
    service = ProjectInvitationService(db)
    return await service.accept_invitation(data)
