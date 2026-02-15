from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Создаем асинхронный менеджер соединения с БД, выключить echo для прода
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True
)

# Сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


# Создаем сессию где отдаем ендпоинт и закрываем ее после использования
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()