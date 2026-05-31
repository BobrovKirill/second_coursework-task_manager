import type { ProjectListItem } from '../../types/project.ts'
import type { ProjectListProps } from './index.ts'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApi from '../../hooks/useApi.ts'
import { useProjectStore } from '../../store/useProjectsStory.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { getDescriptionRole } from '../../utils/roles.ts'
import FieldRole from '../FiedRole/FieldRole.tsx'
import FiledSpecialty from '../FiledSpecialty/FiledSpecialty.tsx'
import styles from './style.module.css'

function ProfileProjects({ editMode = false, icon = null }: ProjectListProps) {
  const { projects, loading, fetchProjects } = useProjectStore()
  const { setLastProjectId, getLastProjectId, user } = useUserStore()
  const navigate = useNavigate()
  const Icon = icon
  const api = useApi()
  const [member, setMember] = useState<Record<number, any>>({})

  useEffect(() => {
    async function init() {
      if (projects.length === 0) {
        await fetchProjects()
      }
    }

    void init()
  }, [])

  useEffect(() => {
    async function loadSpecialties() {
      const memberProjects: Record<number, any> = {}
      for (const project of projects) {
        try {
          const data = await api.get(`/projects/${project.id}/members/${user.id}`)
          if (data) {
            memberProjects[project.id] = data
          }
        }
        catch (e) {
          console.error(e)
        }
      }
      setMember(memberProjects)
    }
    if (projects.length > 0)
      void loadSpecialties()
  }, [projects])

  async function handleProjectClick(event: Event, project: ProjectListItem) {
    event.stopPropagation()
    setLastProjectId(project.id)
    await navigate(`/projects/${project.id}`)
  }

  async function handleProjectEditClick(event: Event, project: ProjectListItem) {
    event.stopPropagation()
    await navigate(`/projects/${project.id}/settings`)
  }

  function handleDelete(event: Event, project: ProjectListItem) {
    event.stopPropagation()
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
                  const userSpecialty = member[project.id]?.specialty
                  const userRole = getDescriptionRole(member[project.id]?.role)

                  return (
                    <li className={`${liquidGlass.card} ${styles.projectItem} ${isActive ? styles.projectItemActive : ''}`} key={project.id} onClick={async event => handleProjectClick(event, project)}>
                      { Icon
                        ? (
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Icon />
                            </ListItemIcon>
                          )
                        : null}

                      <ListItemText className={`${styles.mainButton}`} primary={project.name} />

                      {editMode && (
                        <div className={styles.actions}>
                          <ListItemButton
                            className={styles.iconButton}
                            onClick={async event => handleProjectEditClick(event, project)}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              <EditIcon />
                            </ListItemIcon>
                          </ListItemButton>

                          <ListItemButton
                            className={styles.iconButton}
                            onClick={event => handleDelete(event, project)}
                          >
                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                              <DeleteIcon />
                            </ListItemIcon>
                          </ListItemButton>
                        </div>
                      )}

                      <div className={styles.projectItemFields}>
                        {userRole.title && userRole.descriptionList.length && (
                          <FieldRole
                            value={member[project.id]?.role}
                            readOnly={true}
                            onChange={() => {}}
                          />
                        )}

                        {userSpecialty && (
                          <FiledSpecialty
                            projectId={project.id}
                            data={{ value: userSpecialty?.id, hexColor: userSpecialty?.hex_color } || { value: '' }}
                            readOnly={true}
                            onChange={() => {}}
                          />
                        )}
                      </div>
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
