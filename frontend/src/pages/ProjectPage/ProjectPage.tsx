import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'
import styles from './styles.module.css'

function ProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const { project, loading, error } = useProject(projectId)

  const handleGoToCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/create`)
  }

  if (loading) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Box className={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !project) {
    return (
      <Container maxWidth="xl" className={styles.container}>
        <Alert severity="error" className={styles.errorAlert}>
          Проект не найден или у вас нет доступа к нему
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" className={styles.container}>
      <div className={styles.projectHeader}>
        <div>
          <Typography variant="h4" className={styles.projectName}>
            { project.name }
          </Typography>
          { project.description && (
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          )}
        </div>

        <Button variant="contained" sx={{ alignSelf: 'end' }} onClick={handleGoToCreateTask}>
          Создать задачу
        </Button>
      </div>

      <Outlet context={{ project }} />
    </Container>
  )
}

export default ProjectPage
