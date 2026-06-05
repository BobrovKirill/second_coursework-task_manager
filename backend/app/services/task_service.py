from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.project_member_repository import ProjectMemberRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate, UserTaskRead


class TaskService:
    def __init__(self, db: AsyncSession):
        self.project_repo = ProjectRepository(db)
        self.member_repo = ProjectMemberRepository(db)
        self.task_repo = TaskRepository(db)

    async def create_task(self, project_id: int, data: TaskCreate, current_user_id: int):
        project = await self.project_repo.get_by_id(project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        if project.owner_id != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="Only project owner can create tasks",
            )

        return await self.task_repo.create(project_id, current_user_id, data)

    async def get_project_tasks(self, project_id: int, current_user_id: int):
        project = await self.project_repo.get_by_id(project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_view = (
            project.owner_id == current_user_id
            or await self.member_repo.is_member(project_id, current_user_id)
        )

        if not can_view:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this project",
            )

        return await self.task_repo.get_project_tasks(project_id)

    async def get_user_tasks(self, current_user_id: int):
        tasks = await self.task_repo.get_user_tasks(current_user_id)

        return [
            UserTaskRead(
                id=task.id,
                title=task.title,
                project_id=task.project_id,
                project_name=project_name,
                status=task.status,
                priority=task.priority,
                deadline=task.deadline,
            )
            for task, project_name in tasks
        ]

    async def get_task(self, task_id: int, current_user_id: int):
        task = await self.task_repo.get_by_id(task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        project = await self.project_repo.get_by_id(task.project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_view = (
            project.owner_id == current_user_id
            or await self.member_repo.is_member(project.id, current_user_id)
        )

        if not can_view:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this task",
            )

        return task

    async def update_task(self, task_id: int, data: TaskUpdate, current_user_id: int):
        task = await self.task_repo.get_by_id(task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        project = await self.project_repo.get_by_id(task.project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_update = await self._can_manage_task(
            project_id=project.id,
            project_owner_id=project.owner_id,
            task_creator_id=task.creator_id,
            current_user_id=current_user_id,
        )

        if not can_update:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this task",
            )

        return await self.task_repo.update(task, data)

    async def delete_task(self, task_id: int, current_user_id: int):
        task = await self.task_repo.get_by_id(task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        project = await self.project_repo.get_by_id(task.project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        can_delete = await self._can_manage_task(
            project_id=project.id,
            project_owner_id=project.owner_id,
            task_creator_id=task.creator_id,
            current_user_id=current_user_id,
        )

        if not can_delete:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this task",
            )

        await self.task_repo.delete(task)

    async def _can_manage_task(
        self,
        project_id: int,
        project_owner_id: int,
        task_creator_id: int,
        current_user_id: int,
    ) -> bool:
        if project_owner_id == current_user_id:
            return True

        if task_creator_id == current_user_id:
            return True

        role_name = await self.member_repo.get_member_role_name(project_id, current_user_id)

        return role_name in ("admin", "organizer")
