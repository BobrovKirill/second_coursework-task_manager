import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import BoardColumn from '../../components/BoardColumn'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useTasks } from '../../hooks/useTasks'
import styles from './style.module.css'

const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

function ProjectBoardPage() {
  const { id, projectId } = useParams()

  const currentProjectId = Number(projectId ?? id)
  const hasInvalidProjectId = Number.isNaN(currentProjectId)

  const { tasks, loading, error, deleteTask } = useTasks(
    hasInvalidProjectId ? null : currentProjectId,
  )

  const {
    columns: boardColumns,
    loading: columnsLoading,
    error: columnsError,
  } = useBoardColumns(currentProjectId)

  const { members } = useProjectMembers(
    hasInvalidProjectId ? null : currentProjectId,
  )

  const taskMembers = members.map(member => ({
    id: member.id,
    name: member.username || member.email,
  }))

  const columnsWithStatuses = useMemo(
    () =>
      [...boardColumns]
        .sort((a, b) => a.position - b.position)
        .map((column, index) => ({
          ...column,
          status: TASK_STATUSES[index],
        })),
    [boardColumns],
  )

  if (hasInvalidProjectId) {
    return (
      <Typography color="error">
        Не удалось определить проект
      </Typography>
    )
  }

  if (loading || columnsLoading) {
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

  if (columnsError) {
    return (
      <Alert severity="error">
        Ошибка загрузки колонок:
        {' '}
        {columnsError.message}
      </Alert>
    )
  }

  return (
    <Box className={styles.board}>
      {columnsWithStatuses.map((column) => {
        const columnTasks = column.status === undefined
          ? []
          : tasks.filter(task => task.status === column.status)

        return (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            members={taskMembers}
            onDeleteTask={deleteTask}
          />
        )
      })}
    </Box>
  )
}

export default ProjectBoardPage
