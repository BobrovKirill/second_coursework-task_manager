import { Box, CircularProgress, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import BoardColumn from '../../components/BoardColumn'
import { BOARD_COLUMNS } from '../../constants/board'
import { useTasks } from '../../hooks/useTasks'
import styles from './style.module.css'

function ProjectBoardPage() {
  const { id } = useParams()

  const currentProjectId = id !== undefined ? Number(id) : null

  const { tasks, loading, error } = useTasks(currentProjectId)

  const hasInvalidProjectId = currentProjectId === null || Number.isNaN(currentProjectId)

  if (hasInvalidProjectId) {
    return (
      <Typography color="error">
        Не удалось определить проект
      </Typography>
    )
  }

  if (loading) {
    return (
      <Box className={styles.loader}>
        <CircularProgress />
      </Box>
    )
  }

  if (error !== null) {
    return (
      <Typography color="error">
        {error}
      </Typography>
    )
  }

  return (
    <Box className={styles.board}>
      {BOARD_COLUMNS.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status)

        return (
          <BoardColumn
            key={column.status}
            column={column}
            tasks={columnTasks}
          />
        )
      })}
    </Box>
  )
}

export default ProjectBoardPage
