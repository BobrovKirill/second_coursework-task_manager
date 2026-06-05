import type { ApiErrorResponse } from '../../hooks/useApi.ts'
import type { ProfileTask } from './index.ts'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, CircularProgress, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import useApi from '../../hooks/useApi.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { PROFILE_TASKS_ENDPOINT, PROFILE_TASKS_ERROR_MESSAGE } from './index.ts'
import styles from './style.module.css'

function ProfileTasks() {
  const [tasks, setTasks] = useState<ProfileTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const api = useApi()

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      setLoading(true)
      setError('')

      try {
        const data = await api.get(PROFILE_TASKS_ENDPOINT) as ProfileTask[]
        if (isMounted) {
          setTasks(data)
        }
      }
      catch (requestError: ApiErrorResponse | unknown) {
        const message = (requestError as ApiErrorResponse)?.message || PROFILE_TASKS_ERROR_MESSAGE
        if (isMounted) {
          setError(message)
        }
      }
      finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [api])

  function renderContent() {
    if (loading) {
      return (
        <Box className={styles.state}>
          <CircularProgress size={24} />
        </Box>
      )
    }

    if (error) {
      return (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )
    }

    if (!tasks.length) {
      return (
        <Typography variant="body2" color="text.secondary">
          Нет задач
        </Typography>
      )
    }

    return (
      <List className={styles.taskList} disablePadding>
        {tasks.map(task => (
          <ListItem key={task.id} className={`${liquidGlass.card} ${styles.taskItem}`} disableGutters>
            <ListItemText
              primary={task.title}
              primaryTypographyProps={{ fontWeight: 600 }}
              secondaryTypographyProps={{ component: 'div' }}
              secondary={(
                <Chip
                  className={styles.projectChip}
                  label={`Проект: ${task.projectName}`}
                  size="small"
                  variant="outlined"
                />
              )}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <Accordion className={`${liquidGlass.wrapper} ${styles.card}`} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        id="panel1-header"
      >
        <Typography variant="h6" className={styles.sectionTitle}>Мои задачи</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {renderContent()}
      </AccordionDetails>
    </Accordion>
  )
}

export default ProfileTasks
