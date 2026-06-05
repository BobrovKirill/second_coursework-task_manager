from typing import List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, project_id: int, creator_id: int, data: TaskCreate) -> Task:
        task = Task(
            project_id=project_id,
            creator_id=creator_id,
            assignee_id=data.assignee_id,
            title=data.title,
            description=data.description,
            status=data.status,
            priority=data.priority,
            task_type=data.task_type,
            deadline=data.deadline,
        )
        self.db.add(task)
        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def get_by_id(self, task_id: int) -> Optional[Task]:
        stmt = select(Task).where(Task.id == task_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_project_tasks(self, project_id: int) -> List[Task]:
        stmt = (
            select(Task)
            .where(Task.project_id == project_id)
            .order_by(Task.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_user_tasks(self, user_id: int) -> List[Tuple[Task, str]]:
        stmt = (
            select(Task, Project.name)
            .join(Project, Project.id == Task.project_id)
            .where(
                Task.assignee_id == user_id,
                Project.is_active.is_(True),
            )
            .order_by(Task.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return [(task, project_name) for task, project_name in result.all()]

    async def update(self, task: Task, data: TaskUpdate) -> Task:
        update_data = data.model_dump(exclude_unset=True, by_alias=False)

        for field, value in update_data.items():
            setattr(task, field, value)

        await self.db.commit()
        await self.db.refresh(task)
        return task

    async def delete(self, task: Task) -> None:
        await self.db.delete(task)
        await self.db.commit()
