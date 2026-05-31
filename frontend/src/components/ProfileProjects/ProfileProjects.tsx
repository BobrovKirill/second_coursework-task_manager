import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import ProjectList from '../ProjectList/ProjectList.tsx'
import styles from './style.module.css'

function ProfileProjects() {
  const { getRole } = useUserStore()
  const role = getRole()

  return (
    <Accordion className={`${liquidGlass.wrapper} ${styles.card}`} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="panel1-header"
      >
        <Typography variant="h6" className={styles.sectionTitle}>Мои проекты</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <ProjectList editMode={role === 'admin'} />
      </AccordionDetails>
    </Accordion>
  )
}

export default ProfileProjects
