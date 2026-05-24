import { Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import ProjectList from '../../components/ProjectList/ProjectList.tsx'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import styles from './style.module.css'

function MainPage() {
  const user = useUserStore()
  const currentProjectId = user.getLastProjectId()

  if (!currentProjectId) {
    return (
      <div className={styles.root}>
        <div className={`${liquidGlass.wrapper} ${styles.wrapper}`}>
          <Typography variant="h5" sx={{ margin: '0 0 16px;' }} fontWeight={600}>
            Ваши текущие проекты
          </Typography>

          <ProjectList />
        </div>
      </div>
    )
  }

  return <Navigate to={`projects/${currentProjectId}`} replace />
}

export default MainPage
