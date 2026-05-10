import type { ProjectListItem } from '../../types/project.ts'
import type { ProjectListProps } from './index.ts'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { CircularProgress, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/useProjectsStory.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import styles from './style.module.css'

function ProfileProjects({ editMode = false, icon = null }: ProjectListProps) {
  const { projects, loading, fetchProjects } = useProjectStore()
  const { setLastProjectId, getLastProjectId } = useUserStore()
  const navigate = useNavigate()
  const Icon = icon

  useEffect(() => {

  }, [])
  useEffect(() => {
    if (projects.length === 0) {
      void fetchProjects()
    }
  }, [])

  function handleProjectClick(project: ProjectListItem) {
    setLastProjectId(project.id)
    navigate(`/projects/${project.id}`)
  }

  function handleProjectEditClick(project: ProjectListItem) {
    navigate(`/projects/${project.id}`)
  }

  function handleDelete(project: ProjectListItem) {
    console.log(project)
  }

  return (
    <div className={styles.projects}>
      {loading
        ? <CircularProgress size={20} />
        : projects.length
          ? (
              <List className={styles.projectList} disablePadding>
                {projects.map((project) => {
                  const isActive = getLastProjectId() === project.id

                  return (
                    <li className={styles.projectItem} key={project.id}>
                      { Icon
                        ? (
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Icon />
                            </ListItemIcon>
                          )
                        : null}

                      <ListItemButton
                        selected={isActive}
                        className={`${styles.mainButton} ${isActive ? styles.buttonActive : ''}`}
                        onClick={() => handleProjectClick(project)}
                      >
                        <ListItemText primary={project.name} />
                      </ListItemButton>

                      {editMode && (
                        <div className={styles.actions}>
                          <ListItemButton
                            selected={isActive}
                            className={styles.iconButton}
                            onClick={() => handleProjectEditClick(project)}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              <EditIcon />
                            </ListItemIcon>
                          </ListItemButton>

                          <ListItemButton
                            selected={isActive}
                            className={styles.iconButton}
                            onClick={() => handleDelete(project)}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              <DeleteIcon />
                            </ListItemIcon>
                          </ListItemButton>
                        </div>
                      )}
                    </li>
                  )
                },
                )}
              </List>
            )
          : (
              <Typography variant="body2" color="text.secondary">Нет проектов</Typography>
            )}
    </div>
  )
}

export default ProfileProjects
