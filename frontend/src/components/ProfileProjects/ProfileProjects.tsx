import { Typography } from '@mui/material'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import ProjectList from '../ProjectList/ProjectList.tsx'
import styles from './style.module.css'

function ProfileProjects() {
  const { getRole } = useUserStore()
  const role = getRole()

  return (
    <div className={`${liquidGlass.wrapper} ${styles.card}`}>
      <Typography variant="h6" className={styles.sectionTitle}>Мои проекты</Typography>
      <ProjectList editMode={role === 'admin'} />
    </div>
  )
}

export default ProfileProjects
