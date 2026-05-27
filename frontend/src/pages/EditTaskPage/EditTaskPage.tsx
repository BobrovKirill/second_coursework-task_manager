import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../types/task'
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from '../../components/TaskCard'
import TaskControlPanel from '../../components/TaskControlPanel'
import TaskDesk from '../../components/TaskDesk'
import TaskForm from '../../components/TaskForm'
import { getTaskColumns } from '../../constants/board'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useUserStore } from '../../store/useUserStory'

function getTaskFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status === 'backlog' ? 'todo' : task.status,
    taskType: task.taskType ?? '',
    priority: String(task.priority),
    deadline: task.deadline?.slice(0, 10) ?? '',
    assigneeId: task.assigneeId !== null ? String(task.assigneeId) : '',
  }
}

function formatDeadline(deadline: string | null) {
  if (deadline === null || deadline === '') {
    return '—'
  }

  const date = deadline.slice(0, 10)
  const [year, month, day] = date.split('-')

  if (year === undefined || month === undefined || day === undefined) {
    return deadline
  }

  return `${day}.${month}.${year}`
}

function canDeleteTask(task: Task, userId: number | undefined, role: string | undefined) {
  if (userId === undefined) {
    return false
  }

  return role === 'admin' || role === 'organizer' || task.creatorId === userId
}

function canEditTask(task: Task, userId: number | undefined, role: string | undefined) {
  if (userId === undefined) {
    return false
  }

  return role === 'admin' || role === 'organizer' || task.creatorId === userId
}

function EditTaskPage() {
  const navigate = useNavigate()
  const { projectId, taskId } = useParams()
  const apiRef = useRef(useApi())

  const currentUser = useUserStore(state => state.user)
  const fetchUser = useUserStore(state => state.fetchUser)
  const setLastProjectId = useUserStore(state => state.setLastProjectId)

  const currentProjectId = projectId !== undefined ? Number(projectId) : null
  const currentTaskId = taskId !== undefined ? Number(taskId) : null

  const hasInvalidProjectId = currentProjectId === null || Number.isNaN(currentProjectId)
  const hasInvalidTaskId = currentTaskId === null || Number.isNaN(currentTaskId)

  const { members } = useProjectMembers(currentProjectId)

  const { columns: boardColumns } = useBoardColumns(currentProjectId)
  const taskColumns = useMemo(
    () => getTaskColumns(boardColumns),
    [boardColumns],
  )

  const taskFormMembers = members.map(member => ({
    id: member.user.id,
    name: member.user.username || member.user.email,
  }))

  const [task, setTask] = useState<Task | null>(null)
  const [form, setForm] = useState<TaskFormValues>({
    title: '',
    description: '',
    status: 'todo',
    taskType: '',
    priority: '3',
    deadline: '',
    assigneeId: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleBackToBoard = () => {
    if (hasInvalidProjectId) {
      void navigate(ROUTES.PROJECTS)
      return
    }

    void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
  }

  useEffect(() => {
    if (hasInvalidProjectId) {
      return
    }

    setLastProjectId(currentProjectId)
    void fetchUser()
  }, [currentProjectId, fetchUser, hasInvalidProjectId, setLastProjectId])

  useEffect(() => {
    const loadTask = async () => {
      if (hasInvalidTaskId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = (await apiRef.current.get(`/tasks/${currentTaskId}`)) as Task

        setTask(response)
        setForm(getTaskFormValues(response))
        setIsEditing(false)
      }
      catch {
        setError('Не удалось загрузить задачу')
      }
      finally {
        setIsLoading(false)
      }
    }

    void loadTask()
  }, [currentTaskId, hasInvalidTaskId])

  const handleFormChange = (field: keyof TaskFormValues, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStartEdit = () => {
    if (task === null) {
      return
    }

    setForm(getTaskFormValues(task))
    setError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    if (task !== null) {
      setForm(getTaskFormValues(task))
    }

    setError(null)
    setIsEditing(false)
  }

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    if (isDeleting) {
      return
    }

    setIsDeleteDialogOpen(false)
  }

  const updateTask = async () => {
    if (hasInvalidProjectId || hasInvalidTaskId || isSaving) {
      return
    }

    const title = form.title.trim()

    if (title === '') {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const updatedTask = (await apiRef.current.put(`/tasks/${currentTaskId}`, {
        title,
        description: form.description.trim() || null,
        status: form.status,
        taskType: form.taskType || null,
        priority: Number(form.priority),
        deadline: form.deadline || null,
        assigneeId: form.assigneeId !== '' ? Number(form.assigneeId) : null,
      })) as Task

      setTask(updatedTask)
      setForm(getTaskFormValues(updatedTask))
      setIsEditing(false)
    }
    catch {
      setError('Не удалось сохранить задачу')
    }
    finally {
      setIsSaving(false)
    }
  }

  const deleteTask = async () => {
    if (hasInvalidProjectId || hasInvalidTaskId || isDeleting) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      await apiRef.current.delete(`/tasks/${currentTaskId}`)
      void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
    }
    catch {
      setError('Не удалось удалить задачу')
      setIsDeleteDialogOpen(false)
    }
    finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void updateTask()
  }

  if (hasInvalidProjectId || hasInvalidTaskId) {
    return (
      <Typography color="error">
        Не удалось определить задачу
      </Typography>
    )
  }

  if (isLoading) {
    return (
      <Typography>
        Загрузка задачи...
      </Typography>
    )
  }

  if (task === null) {
    return (
      <Typography color="error">
        {error ?? 'Не удалось загрузить задачу'}
      </Typography>
    )
  }

  const currentStatus = task.status === 'backlog' ? 'todo' : task.status
  const statusLabel = taskColumns.find(column => column.status === currentStatus)?.title ?? currentStatus
  const taskTypeLabel = task.taskType !== null
    ? TASK_TYPE_LABELS[task.taskType] ?? task.taskType
    : '—'
  const priorityLabel = PRIORITY_MAP[task.priority] ?? String(task.priority)
  const deadlineLabel = formatDeadline(task.deadline)
  const assigneeName = task.assigneeId !== null
    ? taskFormMembers.find(member => member.id === task.assigneeId)?.name ?? `#${task.assigneeId}`
    : '—'
  const shouldShowDeleteButton = canDeleteTask(task, currentUser?.id, currentUser?.role)
  const shouldShowEditButton = canEditTask(task, currentUser?.id, currentUser?.role)

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 3,
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      {isEditing
        ? (
            <TaskForm
              title="Редактировать задачу"
              description={error ?? 'Измените поля и сохраните задачу.'}
              values={form}
              columns={taskColumns}
              members={taskFormMembers}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              submitLabel={isSaving ? 'Сохранение...' : 'Сохранить задачу'}
              onCancel={handleCancelEdit}
              cancelLabel="Отмена"
            />
          )
        : (
            <Stack spacing={2} sx={{ width: '100%' }}>
              <TaskDesk
                title={task.title}
                description={task.description}
                error={error}
                canDelete={shouldShowDeleteButton}
                onDeleteTask={handleOpenDeleteDialog}
              />

              <TaskControlPanel
                statusLabel={statusLabel}
                taskTypeLabel={taskTypeLabel}
                priorityLabel={priorityLabel}
                deadlineLabel={deadlineLabel}
                assigneeName={assigneeName}
                canEdit={shouldShowEditButton}
                onEditTask={handleStartEdit}
                onBackToBoard={handleBackToBoard}
              />

              <Dialog
                open={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
              >
                <DialogTitle>
                  Удалить задачу?
                </DialogTitle>

                <DialogContent>
                  <DialogContentText>
                    Задача будет удалена из проекта. Это действие нельзя будет отменить.
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={handleCloseDeleteDialog}
                    disabled={isDeleting}
                  >
                    Отмена
                  </Button>

                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      void deleteTask()
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                  </Button>
                </DialogActions>
              </Dialog>
            </Stack>
          )}
    </Container>
  )
}

export default EditTaskPage
