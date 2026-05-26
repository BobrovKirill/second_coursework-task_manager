import type { TaskControlPanelProps } from './index'
import { Button, Chip, Paper, Stack, Typography } from '@mui/material'

function TaskControlPanel({
  statusLabel,
  taskTypeLabel,
  priorityLabel,
  deadlineLabel,
  assigneeName,
  canEdit,
  onEditTask,
  onBackToBoard,
}: TaskControlPanelProps) {
  return (
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
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Параметры задачи
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`Статус: ${statusLabel}`} />
            <Chip label={`Тип: ${taskTypeLabel}`} />
            <Chip label={`Приоритет: ${priorityLabel}`} />
            <Chip label={`Дедлайн: ${deadlineLabel}`} />
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
          {canEdit && (
            <Button
              size="small"
              variant="contained"
              onClick={onEditTask}
              sx={{
                height: 30,
                px: 1.5,
                fontSize: '0.72rem',
              }}
            >
              Редактировать
            </Button>
          )}

          <Button
            size="small"
            variant="contained"
            onClick={onBackToBoard}
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
    </Paper>
  )
}

export default TaskControlPanel
