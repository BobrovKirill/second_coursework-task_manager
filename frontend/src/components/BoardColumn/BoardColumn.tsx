import type { BoardColumnProps } from './index'
import { Box, Paper, Typography } from '@mui/material'
import TaskCard from '../TaskCard'
import styles from './style.module.css'

function BoardColumn({ column, tasks, members = [], onDeleteTask }: BoardColumnProps) {
  return (
    <Paper elevation={0} className={styles.column}>
      <Typography variant="subtitle1" className={styles.title}>
        {column.title}
      </Typography>

      <Box className={styles.tasks}>
        {tasks.length === 0
          ? (
              <Box className={styles.empty}>
                <Typography variant="body2" color="text.secondary">
                  Нет задач
                </Typography>
              </Box>
            )
          : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  onDeleteTask={onDeleteTask}
                />
              ))
            )}
      </Box>
    </Paper>
  )
}

export default BoardColumn
