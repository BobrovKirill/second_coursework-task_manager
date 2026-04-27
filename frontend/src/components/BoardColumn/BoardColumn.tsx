import type { BoardColumnProps } from './index.ts'
import { Box, Paper, Typography } from '@mui/material'
import TaskCard from '../TaskCard'
import styles from './style.module.css'

export default function BoardColumn({ column, tasks, members, columns, onChangeTaskColumn, onEditTask, onDeleteTask }: BoardColumnProps) {
  return (
    <Paper elevation={0} className={styles.column}>
      <Typography variant="subtitle1" className={styles.title}>
        {column.title}
      </Typography>

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
                columns={columns}
                onChangeTaskColumn={onChangeTaskColumn}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))
          )}
    </Paper>
  )
}
