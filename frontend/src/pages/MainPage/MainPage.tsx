import { Box, Container, Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../../store/useUserStory.ts'

function MainPage() {
  const user = useUserStore()
  // TODO добавить проверук на количество проектов, и в случае если их много давать право выбора и если нет последнего
  const hasMoreOneProjects = false
  const currentProjectId = user.getLastProjectId()

  if (hasMoreOneProjects) {
    return (
      <Container>
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Главная страница
          </Typography>
          <Typography variant="body1">
            Добро пожаловать!
          </Typography>
        </Box>
      </Container>
    )
  }

  return <Navigate to={`projects/${currentProjectId}`} replace />
}

export default MainPage
