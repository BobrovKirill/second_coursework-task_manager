import type { TaskCardProps } from './index'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Card, CardContent, Chip, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { TASK_TYPE_LABELS } from '../../mocks/boardMock'
import { PRIORITY_MAP } from './index'
import styles from './style.module.css'

function TaskCard({ task, members, columns, onChangeTaskColumn, onDeleteTask }: TaskCardProps) {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const taskMembers = members.filter(member => task.assigneeIds.includes(member.id))

  function onEditTask(id) {
    navigate(`/projects/${projectId}/tasks/${id}`)
  }

  return (
    <Card variant="outlined" className={styles.card}>
      <CardContent className={styles.content}>

        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
          className={styles.title}
        >
          {task.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.description}
        >
          {task.description || '—'}
        </Typography>

        <Stack direction="row" spacing={1} className={styles.meta}>
          <Chip
            size="small"
            label={`Тип: ${TASK_TYPE_LABELS[task.type]}`}
          />
          <Chip
            size="small"
            label={`Приоритет: ${PRIORITY_MAP[task.priorityId] ?? task.priorityId}`}
          />
          <Chip size="small" label={`Дедлайн: ${task.deadline ?? '—'}`} />
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          className={styles.footer}
        >
          <Typography variant="caption">
            Исполнители:
            {' '}
            {taskMembers.length
              ? taskMembers.map(member => member.name).join(', ')
              : '—'}
          </Typography>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              className={styles.iconButton}
              onClick={() => onEditTask(task.id)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              className={styles.iconButton}
              onClick={() => onDeleteTask(task.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <TextField
          select
          label="Статус"
          size="small"
          fullWidth
          value={String(task.columnId)}
          onChange={e => onChangeTaskColumn(task.id, Number(e.target.value))}
          className={styles.selectField}
        >
          {columns.map(column => (
            <MenuItem key={column.id} value={String(column.id)}>
              {column.title}
            </MenuItem>
          ))}
        </TextField>
      </CardContent>
    </Card>
  )
}

export default TaskCard
