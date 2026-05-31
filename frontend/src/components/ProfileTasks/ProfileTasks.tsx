import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import liquidGlass from '../../styles/liquidGlass.module.css'
import styles from './style.module.css'

function ProfileTasks() {
  return (
    <Accordion className={`${liquidGlass.wrapper} ${styles.card}`} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="panel1-header"
      >
        <Typography variant="h6" className={styles.sectionTitle}>Мои задачи</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <div className={styles.projectChips}>
          <Typography variant="body2" color="text.secondary">Нет задач</Typography>
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default ProfileTasks
