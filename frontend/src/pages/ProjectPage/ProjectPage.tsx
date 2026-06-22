import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../../hooks/useProject'
import { useProjectBackground } from '../../hooks/useProjectBackground'
import { useProjectFontColor } from '../../hooks/useProjectFontColor'
import { useEffect } from 'react'
import styles from './styles.module.css'

function ProjectPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const { project, loading, error } = useProject(projectId)

  const backdropStyle = useProjectBackground(
    project?.background_type,
    project?.background_value ?? null,
  )
  const fontTheme = useProjectFontColor(project?.font_color)

  const isSettingsPage = location.pathname.endsWith('/settings')

  useEffect(() => {
    if (!project) return

    let newBackgroundStyle: React.CSSProperties = {}

    if (project.background_type === 'color' && project.background_value) {
      newBackgroundStyle = {
        backgroundImage: 'none',
        backgroundColor: project.background_value,
      }
    } else if (project.background_type === 'gradient' && project.background_value) {
      const [c1, c2, angle] = project.background_value.split('|')
      newBackgroundStyle = {
        backgroundImage: `linear-gradient(${angle || '90'}deg, ${c1 || '#ffffff'}, ${c2 || '#000000'})`,
        backgroundColor: 'transparent',
      }
    } else if (project.background_type === 'image' && project.background_value) {
      newBackgroundStyle = {
        backgroundImage: `url(${project.background_value})`,
        backgroundColor: 'transparent',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }
    } else {
      newBackgroundStyle = {}
    }

    window.dispatchEvent(new CustomEvent('updateAppBackground', { 
      detail: newBackgroundStyle 
    }))

    return () => {
      window.dispatchEvent(new CustomEvent('updateAppBackground', { 
        detail: {} 
      }))
    }
  }, [project?.background_type, project?.background_value])

  const handleGoToCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/create`)
  }

  const truncateText = (text: string, maxLength: number = 75) => {
    if (text.length <= maxLength)
      return text
    return `${text.substring(0, maxLength).trim()}...`
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
            <div className={`${styles.projectHeader} ${isSettingsPage ? styles.projectHeaderHidden : ''}`}>
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
