import type { KeyboardEvent } from 'react'
import type { TaskCardProps } from './index'
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from './index'
import styles from './style.module.css'

function TaskCard({ task, members = [] }: TaskCardProps) {
  const { id, projectId } = useParams()
  const navigate = useNavigate()

  const currentProjectId = projectId ?? id

  function handleOpenTask() {
    if (currentProjectId === undefined || currentProjectId.trim() === '') {
      return
    }

    void navigate(ROUTES.EDIT_TASK(currentProjectId, task.id))
  }

  function handleOpenTaskByKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    handleOpenTask()
  }

  const taskTypeLabel = task.taskType !== null
    ? TASK_TYPE_LABELS[task.taskType] ?? task.taskType
    : '—'

  const assigneeName = task.assigneeId !== null
    ? members.find(member => member.id === task.assigneeId)?.name ?? `#${task.assigneeId}`
    : '—'

  return (
    <Card
      variant="outlined"
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleOpenTask}
      onKeyDown={handleOpenTaskByKeyboard}
    >
      <CardContent className={styles.content}>
        <Typography
          variant="subtitle2"
          className={styles.title}
        >
          {task.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.description}
        >
          {task.description ?? '—'}
        </Typography>

        <Stack spacing={0.75} className={styles.meta}>
          <Chip
            size="small"
            label={`Тип: ${taskTypeLabel}`}
          />

          <Chip
            size="small"
            label={`Приоритет: ${PRIORITY_MAP[task.priority] ?? task.priority}`}
          />

          <Chip
            size="small"
            label={`Дедлайн: ${task.deadline ?? '—'}`}
          />
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className={styles.footer}
        >
          <Typography variant="caption">
            Исполнитель:
            {' '}
            {assigneeName}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TaskCard
