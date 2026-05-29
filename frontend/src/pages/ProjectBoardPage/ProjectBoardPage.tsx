import type { Task } from '../../types/task'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import BoardColumn from '../../components/BoardColumn'
import { getTaskColumns } from '../../constants/board'
import { useBoardColumns } from '../../hooks/useBoardColumn'
import { useProjectMembers } from '../../hooks/useProjectMembers'
import { useTasks } from '../../hooks/useTasks'
import { useUserStore } from '../../store/useUserStory'
import styles from './style.module.css'

function canMoveTask(task: Task, userId: number | undefined, role: string | undefined) {
  if (userId === undefined) {
    return false
  }

  return role === 'admin' || role === 'organizer' || task.creatorId === userId
}

function ProjectBoardPage() {
  const { id, projectId } = useParams()
  const currentProjectId = Number(projectId ?? id)
  const hasInvalidProjectId = Number.isNaN(currentProjectId)

  const currentUser = useUserStore(state => state.user)
  const fetchUser = useUserStore(state => state.fetchUser)
  const setLastProjectId = useUserStore(state => state.setLastProjectId)

  const { tasks, loading, error, updateTaskStatus } = useTasks(
    hasInvalidProjectId ? null : currentProjectId,
  )

  const {
    columns: boardColumns,
    loading: columnsLoading,
    error: columnsError,
  } = useBoardColumns(hasInvalidProjectId ? null : currentProjectId)

  const { members } = useProjectMembers(
    hasInvalidProjectId ? null : currentProjectId,
  )

  useEffect(() => {
    if (hasInvalidProjectId) {
      return
    }

    setLastProjectId(currentProjectId)
    void fetchUser()
  }, [currentProjectId, fetchUser, hasInvalidProjectId, setLastProjectId])

  const taskMembers = members.map(member => ({
    id: member.user.id,
    name: member.user.username || member.user.email,
  }))

  const columnsWithStatuses = useMemo(
    () => getTaskColumns(boardColumns),
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
        const columnTasks = tasks.filter(task => task.status === column.status)

        return (
          <BoardColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            members={taskMembers}
            onTaskStatusChange={updateTaskStatus}
            canMoveTask={task => canMoveTask(task, currentUser?.id, currentUser?.role)}
          />
        )
      })}
    </Box>
  )
}

export default ProjectBoardPage
