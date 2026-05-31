import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ProfileProjects from '../../components/ProfileProjects/ProfileProjects.tsx'
import ProfileTasks from '../../components/ProfileTasks/ProfileTasks.tsx'
import ProfileUser from '../../components/ProfileUser/ProfileUser.tsx'
import { ROUTES } from '../../constants/routes.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import base from '../../styles/formBase.module.css'
import { removeToken } from '../../utils/cookie.ts'
import styles from './style.module.css'

function ProfilePage() {
  const navigate = useNavigate()
  const { removeLastProjectId } = useUserStore()

  function handleLogout() {
    removeToken()
    removeLastProjectId()

    navigate(ROUTES.AUTH)
  }

  return (
    <div className={styles.root}>
      <ProfileUser />
      <ProfileProjects />
      <ProfileTasks />

      <Button variant="contained" color="error" onClick={handleLogout} className={`${base.submitButton} ${styles.layoutButton}`}>
        Выйти
      </Button>
    </div>
  )
}

export default ProfilePage
