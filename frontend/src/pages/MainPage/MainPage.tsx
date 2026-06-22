import AddIcon from '@mui/icons-material/Add'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import CreateProjectModal from '../../components/CreateProjectModal'
import ProjectList from '../../components/ProjectList/ProjectList.tsx'
import { useProjectStore } from '../../store/useProjectsStory.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import styles from './style.module.css'

function MainPage() {
  const user = useUserStore()
  const currentProjectId = user.getLastProjectId()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { projects, getProjects, fetchProjects, loading } = useProjectStore()

  useEffect(() => {
    if (getProjects().length === 0) {
      void fetchProjects()
    }
  }, [])

  if (!currentProjectId) {
    return (
      <div className={styles.root}>
        {loading
          ? (<CircularProgress size={20} sx={{ color: '#fff' }} />)
          : projects.length > 0
            ? (
                <div className={`${liquidGlass.wrapper} ${styles.wrapper}`}>
                  <Typography variant="h5" sx={{ margin: '0 0 16px' }} fontWeight={600}>
                    Ваши текущие проекты
                  </Typography>

                  <ProjectList />
                </div>
              )
            : (
                <Box>
                  <Typography variant="h2" sx={{ fontSize: '32px', color: 'white', margin: '0 0 16px', textAlign: 'center' }} fontWeight={600}> Нет проектов </Typography>
                  <Typography sx={{ fontSize: '18px', color: 'white', margin: '0 0 16px', textAlign: 'center' }}> Дождитесь приглашения или создайте собсвеный проект </Typography>

                  <Button variant="contained" sx={{ display: 'flex', fontSize: '18px', textAlign: 'center', margin: '24px auto 0' }} startIcon={<AddIcon />} onClick={() => setIsCreateModalOpen(true)} size="small">
                    Создать проект
                  </Button>
                </Box>
              )}

        <CreateProjectModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
          }}
        />
      </div>
    )
  }

  return <Navigate to={`projects/${currentProjectId}`} replace />
}

export default MainPage
