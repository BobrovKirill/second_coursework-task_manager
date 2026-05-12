import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  ThemeProvider,
} from '@mui/material'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'
import { useProjectBackground } from '../../hooks/useProjectBackground'
import { useProjectFontColor } from '../../hooks/useProjectFontColor'
import styles from './styles.module.css'

function ProjectPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const { project, loading, error } = useProject(projectId)

  const backdropStyle = useProjectBackground(
    project?.background_type,
    project?.background_value ?? null
  )
  const fontTheme = useProjectFontColor(project?.font_color)

  const handleGoToCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/create`)
  }

  const truncateText = (text: string, maxLength: number = 75) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div className={styles.projectWrapper}>
        <div className={styles.backdrop} />
        <div className={styles.glass}>
          <Container maxWidth="xl" className={styles.container}>
            <Box className={styles.loadingContainer}>
              <CircularProgress />
            </Box>
          </Container>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className={styles.projectWrapper}>
        <div className={styles.backdrop} />
        <div className={styles.glass}>
          <Container maxWidth="xl" className={styles.container}>
            <Alert severity="error" className={styles.errorAlert}>
              Проект не найден или у вас нет доступа к нему
            </Alert>
          </Container>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.projectWrapper}>
      <div className={styles.backdrop} style={backdropStyle} />
      <div className={styles.glass}>
        <ThemeProvider theme={fontTheme}>
          <Container maxWidth="xl" className={styles.container}>
            <div className={styles.projectHeader}>
              <div>
                <Typography 
                  variant="h4" 
                  className={styles.projectName}
                  sx={{ color: 'text.primary' }}
                >
                  {project.name}
                </Typography>
                {project.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: '600px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                    title={project.description}
                  >
                    {truncateText(project.description)}
                  </Typography>
                )}
              </div>
              <Button
                variant="contained"
                sx={{ alignSelf: 'end' }}
                onClick={handleGoToCreateTask}
              >
                Создать задачу
              </Button>
            </div>
            <Outlet context={{ project, fontTheme }} />
          </Container>
        </ThemeProvider>
      </div>
    </div>
  )
}

export default ProjectPage