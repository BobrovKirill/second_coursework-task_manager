import ProfileProjects from '../../components/ProfileProjects/ProfileProjects.tsx'
import ProfileTasks from '../../components/ProfileTasks/ProfileTasks.tsx'
import ProfileUser from '../../components/ProfileUser/ProfileUser.tsx'
import styles from './style.module.css'

function ProfilePage() {
  return (
    <div className={styles.root}>
      <ProfileUser />
      <ProfileProjects />
      <ProfileTasks />
    </div>
  )
}

export default ProfilePage
