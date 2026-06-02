import type { FormEvent } from 'react'
import type { TaskFormValues } from '../../components/TaskForm'
import type { Task } from '../../types/task'
import { Container, Typography } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskForm from '../../components/TaskForm'
import TaskPendingAttachments from '../../components/TaskPendingAttachments'
import { getTaskColumns } from '../../constants/board'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'

function CreateTaskPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const apiRef = useRef(useApi())

  const currentProjectId = projectId !== undefined ? Number(projectId) : null
  const hasInvalidProjectId = currentProjectId === null || Number.isNaN(currentProjectId)

  const { members } = useProjectMembers(currentProjectId)

  const { columns: boardColumns } = useBoardColumns(currentProjectId)
  const taskColumns = useMemo(
    () => getTaskColumns(boardColumns),
    [boardColumns],
  )

  const taskFormMembers = members.map((member) => {
    const user = member.user ?? member.member

    return {
      id: user.id,
      name: user.username ?? user.email,
    }
  })

  const [form, setForm] = useState<TaskFormValues>({
    title: '',
    description: '',
    status: 'todo',
    taskType: 'frontend',
    priority: '3',
    deadline: '',
    assigneeId: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const handleBackToBoard = () => {
    if (hasInvalidProjectId) {
      void navigate(ROUTES.PROJECTS)
      return
    }

    void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
  }

  const handleFormChange = (field: keyof TaskFormValues, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddPendingFiles = (files: File[]) => {
    setPendingFiles(prev => [...prev, ...files])
  }

  const handleRemovePendingFile = (fileIndex: number) => {
    setPendingFiles(prev => prev.filter((_, index) => index !== fileIndex))
  }

  const uploadPendingFiles = async (createdTaskId: number) => {
    for (const file of pendingFiles) {
      const formData = new FormData()
      formData.append('file', file)

      await apiRef.current.post(`/tasks/${createdTaskId}/attachments/`, formData)
    }
  }

  const createTask = async () => {
    if (hasInvalidProjectId || isSaving) {
      return
    }

    const title = form.title.trim()

    if (title === '') {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const createdTask = (await apiRef.current.post(`/projects/${currentProjectId}/tasks`, {
        title,
        description: form.description.trim() || null,
        status: form.status,
        taskType: form.taskType || null,
        priority: Number(form.priority),
        deadline: form.deadline || null,
        assigneeId: form.assigneeId !== '' ? Number(form.assigneeId) : null,
      })) as Task

      if (pendingFiles.length > 0) {
        await uploadPendingFiles(createdTask.id)
      }

      void navigate(ROUTES.PROJECT_BOARD(currentProjectId))
    }
    catch {
      setError('Не удалось создать задачу или загрузить вложения')
    }
    finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void createTask()
  }

  if (hasInvalidProjectId) {
    return (
      <Typography color="error">
        Не удалось определить проект
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
        title="Создать задачу"
        description={error ?? 'Заполните поля и сохраните новую задачу.'}
        extraContent={(
          <TaskPendingAttachments
            files={pendingFiles}
            disabled={isSaving}
            onAddFiles={handleAddPendingFiles}
            onRemoveFile={handleRemovePendingFile}
          />
        )}
        values={form}
        columns={taskColumns}
        members={taskFormMembers}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        submitLabel={isSaving ? 'Сохранение...' : 'Создать задачу'}
        onCancel={handleBackToBoard}
        cancelLabel="Отмена"
      />
    </Container>
  )
}

export default CreateTaskPage
