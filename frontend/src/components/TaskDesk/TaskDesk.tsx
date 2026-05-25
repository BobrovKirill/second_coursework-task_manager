import type { TaskDeskProps } from './index'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { IconButton, Paper, Stack, Typography } from '@mui/material'

function TaskDesk({ title, description, error, canDelete, onDeleteTask }: TaskDeskProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        width: '100%',
        p: 3,
        borderRadius: 4,
        border: '1px solid rgba(255, 255, 255, 0.55)',
        background: 'rgba(255, 255, 255, 0.72)',
        boxShadow: '0 10px 28px rgba(31, 38, 135, 0.12)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {canDelete && (
        <IconButton
          size="small"
          color="error"
          onClick={onDeleteTask}
          aria-label="Удалить задачу"
          sx={{
            'position': 'absolute',
            'top': 16,
            'right': 16,
            'width': 30,
            'height': 30,
            'borderRadius': 1,
            'border': '1px solid rgba(211, 47, 47, 0.35)',
            'backgroundColor': 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.08)',
            },
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}

      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          {title}
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
          {description ?? 'Описание не заполнено'}
        </Typography>
      </Stack>
    </Paper>
  )
}

export default TaskDesk
