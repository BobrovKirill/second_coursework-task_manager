import { Box, Button, Container, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../../services/project'
import { ROUTES } from '../../constants/routes'
import type { ProjectListItem } from '../../types/project'

function MainPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await projectsApi.getAll()
        setProjects(data)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleOpenBoard = () => {
    if (projects.length === 0) {
      return
    }

    navigate(ROUTES.PROJECT_BOARD(projects[0].id))
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h3" gutterBottom>
        Главная страница
      </Typography>

      <Typography>Добро пожаловать!</Typography>

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleOpenBoard}
        disabled={loading || projects.length === 0}
      >
        Открыть доску
      </Button>

      {!loading && projects.length === 0 && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          У вас пока нет проектов. Сначала создайте проект.
        </Typography>
      )}
    </Container>
  )
}

export default MainPage