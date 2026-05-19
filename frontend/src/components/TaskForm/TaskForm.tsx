import type { FormEvent } from 'react'
import type { TaskStatus } from '../../types/task'
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import styles from './style.module.css'

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  taskType: string
  priority: string
  deadline: string
  assigneeId: string
}

interface TaskFormProps {
  title: string
  description?: string
  values: TaskFormValues
  columns: Array<{
    status: TaskStatus
    title: string
  }>
  members?: Array<{
    id: number
    name: string
  }>
  onChange: (field: keyof TaskFormValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel: string
  onCancel?: () => void
  cancelLabel?: string
}

const taskTypeOptions = [
  { value: 'frontend', label: 'Фронтенд' },
  { value: 'backend', label: 'Бэкенд' },
  { value: 'design', label: 'Дизайн' },
  { value: 'research', label: 'Исследование' },
]

const priorityOptions = [
  { value: '1', label: 'Минимальный' },
  { value: '2', label: 'Низкий' },
  { value: '3', label: 'Средний' },
  { value: '4', label: 'Высокий' },
  { value: '5', label: 'Критический' },
]

function TaskForm({
  title,
  description,
  values,
  columns,
  members = [],
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
  cancelLabel = 'Отмена',
}: TaskFormProps) {
  return (
    <Stack component="form" className={styles.form} spacing={2} onSubmit={onSubmit}>
      <Paper className={styles.taskContent} elevation={0}>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>

          {description !== undefined && description !== '' && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}

          <TextField
            label="Название"
            size="small"
            value={values.title}
            onChange={event => onChange('title', event.target.value)}
            required
            fullWidth
          />

          <TextField
            className={styles.descriptionField}
            label="Описание"
            size="small"
            multiline
            minRows={12}
            value={values.description}
            onChange={event => onChange('description', event.target.value)}
            placeholder="Подробно опишите задачу"
            fullWidth
          />
        </Stack>
      </Paper>

      <div className={styles.controlsBlock}>
        <Typography variant="subtitle1" className={styles.controlsTitle}>
          Параметры задачи
        </Typography>

        <div className={styles.controlsGrid}>
          <TextField
            select
            label="Статус"
            size="small"
            value={values.status}
            onChange={event => onChange('status', event.target.value)}
            fullWidth
          >
            {columns.map(column => (
              <MenuItem key={column.status} value={column.status}>
                {column.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Тип"
            size="small"
            value={values.taskType}
            onChange={event => onChange('taskType', event.target.value)}
            fullWidth
          >
            <MenuItem value="">Не выбран</MenuItem>
            {taskTypeOptions.map(taskType => (
              <MenuItem key={taskType.value} value={taskType.value}>
                {taskType.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Приоритет"
            size="small"
            value={values.priority}
            onChange={event => onChange('priority', event.target.value)}
            fullWidth
          >
            {priorityOptions.map(priority => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Дедлайн"
            type="date"
            size="small"
            value={values.deadline}
            onChange={event => onChange('deadline', event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            select
            label="Исполнитель"
            size="small"
            value={values.assigneeId}
            onChange={event => onChange('assigneeId', event.target.value)}
            fullWidth
          >
            <MenuItem value="">Не выбран</MenuItem>
            {members.map(member => (
              <MenuItem key={member.id} value={String(member.id)}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <Stack direction="row" spacing={1} className={styles.actions}>
          <Button type="submit" variant="contained">
            {submitLabel}
          </Button>

          {onCancel !== undefined && (
            <Button variant="outlined" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </Stack>
      </div>
    </Stack>
  )
}

export default TaskForm
