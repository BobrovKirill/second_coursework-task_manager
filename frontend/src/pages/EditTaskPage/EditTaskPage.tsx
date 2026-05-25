import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../types/task'
import {
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from '../../components/TaskCard'
import TaskForm from '../../components/TaskForm'
import { getTaskColumns } from '../../constants/board'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'

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

function EditTaskPage() {
  const navigate = useNavigate()
  const { projectId, taskId } = useParams()
  const apiRef = useRef(useApi())

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
    id: member.id,
    name: member.username || member.email,
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

  const handleBackToBoard = () => {
    if (hasInvalidProjectId) {
      void navigate(ROUTES.PROJECTS)
      return
    }

    void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
  }

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
  const assigneeName = task.assigneeId !== null
    ? taskFormMembers.find(member => member.id === task.assigneeId)?.name ?? `#${task.assigneeId}`
    : '—'

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
              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  background: 'rgba(255, 255, 255, 0.72)',
                  boxShadow: '0 10px 28px rgba(31, 38, 135, 0.12)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="h4" component="h1">
                    {task.title}
                  </Typography>

                  {error !== null && (
                    <Typography color="error">
                      {error}
                    </Typography>
                  )}

                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                    }}
                  >
                    {task.description ?? 'Описание не заполнено'}
                  </Typography>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  width: '100%',
                  p: 2,
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.55)',
                  background: 'rgba(255, 255, 255, 0.72)',
                  boxShadow: '0 10px 28px rgba(31, 38, 135, 0.12)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Параметры задачи
                      </Typography>

                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        <Chip label={`Статус: ${statusLabel}`} />
                        <Chip label={`Тип: ${taskTypeLabel}`} />
                        <Chip label={`Приоритет: ${PRIORITY_MAP[task.priority] ?? task.priority}`} />
                        <Chip label={`Дедлайн: ${formatDeadline(task.deadline)}`} />
                        <Chip label={`Исполнитель: ${assigneeName}`} />
                      </Stack>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        flexShrink: 0,
                        mb: 0.25,
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleStartEdit}
                        sx={{
                          height: 30,
                          px: 1.5,
                          fontSize: '0.72rem',
                        }}
                      >
                        Редактировать
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleBackToBoard}
                        sx={{
                          'height': 30,
                          'px': 1.5,
                          'fontSize': '0.72rem',
                          'backgroundColor': 'rgba(255, 255, 255, 0.9)',
                          'color': 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                          },
                        }}
                      >
                        Назад к доске
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          )}
    </Container>
  )
}

export default EditTaskPage
