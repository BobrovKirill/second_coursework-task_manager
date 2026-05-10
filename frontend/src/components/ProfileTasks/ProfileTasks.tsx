import { Typography } from '@mui/material'
import liquidGlass from '../../styles/liquidGlass.module.css'
import styles from './style.module.css'

function ProfileTasks() {
  return (
    <div className={`${liquidGlass.wrapper} ${styles.card}`}>
      <Typography variant="h6" className={styles.sectionTitle}>Мои задачи</Typography>
      <div className={styles.projectChips}>
        <Typography variant="body2" color="text.secondary">Нет задач</Typography>
      </div>
    </div>
  )
}

export default ProfileTasks
