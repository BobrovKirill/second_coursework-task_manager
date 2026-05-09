import type { TaskCardProps } from './index'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PRIORITY_MAP, TASK_TYPE_LABELS } from './index'
import styles from './style.module.css'

function TaskCard({ task, members = [], onDeleteTask }: TaskCardProps) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  function handleOpenTask() {
    if (id === undefined || id.trim() === '') {
      return
    }

    void navigate(`/projects/${id}/tasks/${task.id}`)
  }

  function handleOpenDeleteDialog() {
    setIsDeleteDialogOpen(true)
  }

  function handleCloseDeleteDialog() {
    setIsDeleteDialogOpen(false)
  }

  function handleConfirmDeleteTask() {
    if (onDeleteTask === undefined) {
      return
    }

    setIsDeleteDialogOpen(false)
    void onDeleteTask(task.id)
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

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              className={styles.iconButton}
              onClick={handleOpenTask}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              color="error"
              className={styles.iconButton}
              onClick={handleOpenDeleteDialog}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
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
          <Button onClick={handleCloseDeleteDialog}>
            Отмена
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDeleteTask}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  )
}

export default TaskCard
