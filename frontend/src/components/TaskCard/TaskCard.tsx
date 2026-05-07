import type { TaskCardProps } from './index'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from './index'
import styles from './style.module.css'

function TaskCard({ task, members = [] }: TaskCardProps) {
  const { id } = useParams()
  const navigate = useNavigate()

  function handleOpenTask() {
    if (id === undefined || id.trim() === '') {
      return
    }

    void navigate(`/projects/${id}/tasks/${task.id}`)
  }

  const taskTypeLabel = task.taskType !== null
    ? TASK_TYPE_LABELS[task.taskType] ?? task.taskType
    : '—'

  const assigneeName = task.assigneeId !== null
    ? members.find(member => member.id === task.assigneeId)?.name ?? `#${task.assigneeId}`
    : '—'

  return (
    <Card variant="outlined" className={styles.card}>
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

        <Stack direction="row" spacing={1} className={styles.meta}>
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

          <IconButton
            size="small"
            className={styles.iconButton}
            onClick={handleOpenTask}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TaskCard
