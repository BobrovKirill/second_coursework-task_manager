import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../types/task'
import { Container, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskForm from '../../components/TaskForm'
import { BOARD_COLUMNS } from '../../constants/board'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import { useProjectMembers } from '../../hooks/useProjectMembers'

function EditTaskPage() {
  const navigate = useNavigate()
  const { projectId, taskId } = useParams()
  const apiRef = useRef(useApi())

  const currentProjectId = projectId !== undefined ? Number(projectId) : null
  const currentTaskId = taskId !== undefined ? Number(taskId) : null

  const hasInvalidProjectId = currentProjectId === null || Number.isNaN(currentProjectId)
  const hasInvalidTaskId = currentTaskId === null || Number.isNaN(currentTaskId)

  const { members } = useProjectMembers(currentProjectId)

  const taskFormMembers = members.map(member => ({
    id: member.id,
    name: member.username || member.email,
  }))

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
        const response: unknown = await apiRef.current.get(`/tasks/${currentTaskId}`)
        const task = response as Task

        setForm({
          title: task.title,
          description: task.description ?? '',
          status: task.status === 'backlog' ? 'todo' : task.status,
          taskType: task.taskType ?? '',
          priority: String(task.priority),
          deadline: task.deadline?.slice(0, 10) ?? '',
          assigneeId: task.assigneeId !== null ? String(task.assigneeId) : '',
        })
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
      await apiRef.current.put(`/tasks/${currentTaskId}`, {
        title,
        description: form.description.trim() || null,
        status: form.status,
        taskType: form.taskType || null,
        priority: Number(form.priority),
        deadline: form.deadline || null,
        assigneeId: form.assigneeId !== '' ? Number(form.assigneeId) : null,
      })

      void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
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
      <TaskForm
        title="Редактировать задачу"
        description={error ?? 'Измените поля и сохраните задачу.'}
        values={form}
        columns={BOARD_COLUMNS}
        members={taskFormMembers}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        submitLabel={isSaving ? 'Сохранение...' : 'Сохранить задачу'}
        onCancel={handleBackToBoard}
        cancelLabel="Отмена"
      />
    </Container>
  )
}

export default EditTaskPage
