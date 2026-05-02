from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.users import router as users
from app.api.v1.auth import router as auth
from app.api.v1.projects import router as projects 
from app.api.v1.tasks import router as tasks
from app.core.database import AsyncSessionLocal
from app.core.seeds import seed_roles_and_permissions

# Создание приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключение роутеров
app.include_router(users, prefix=settings.API_V1_PREFIX)
app.include_router(auth, prefix=settings.API_V1_PREFIX)
app.include_router(projects, prefix=settings.API_V1_PREFIX)
app.include_router(tasks, prefix=settings.API_V1_PREFIX)



@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": f"{settings.API_V1_PREFIX}/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}

# создаем декоратор, который запускается при запуске сервера для заполнения roles и permissions, если они не заполнены
@app.on_event("startup")
async def startup_event():
    async with AsyncSessionLocal() as db:
        await seed_roles_and_permissions(db)