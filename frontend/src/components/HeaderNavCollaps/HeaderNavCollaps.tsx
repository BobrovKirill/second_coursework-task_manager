import type { CollapsibleSectionProps } from './index.ts'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMembersStore } from '../../store/useMemberStore.ts'
import { useProjectStore } from '../../store/useProjectsStory.ts'
import { useUserStore } from '../../store/useUserStory'

function CollapsibleSection({ item, onNavigate, onCreateProject, onAddMember }: CollapsibleSectionProps) {
  const { getMembers, fetchMembers, loading } = useMembersStore()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loadingProject, setLoadingProject] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const { getLastProjectId, getRole } = useUserStore()
  const { getProjects, fetchProjects } = useProjectStore()
  const projectId = getLastProjectId()

  const isAdmin = getRole() === 'admin'

  useEffect(() => {
    if (item.isMembers) {
      setItems([])
      setOpen(false)
      setError(null)
    }
  }, [location.pathname, item.isMembers])

  async function handleToggle() {
    if (item.isMembers) {
      if (!projectId) {
        return
      }

      const currentMembers = getMembers(projectId)

      if (!open) {
        if (currentMembers.length === 0) {
          setLoadingProject(true)
          try {
            await fetchMembers(projectId)
            const freshMembers = getMembers(projectId)
            setItems(freshMembers)
          }
          catch (err) {
            setError('Не удалось загрузить участников')
            console.error(err)
          }
          finally {
            setLoadingProject(false)
          }
        }
        else {
          setItems(currentMembers)
        }
      }
    }
    else {
      // твой код для проектов (оставляем как есть)
      if (!open && !items.length) {
        setLoadingProject(true)
        setError(null)
        try {
          const projects = getProjects()
          const data = projects.length ? projects : await fetchProjects()
          setItems(data)
        }
        catch (err) {
          setError('Не удалось загрузить данные')
          console.error(err)
        }
        finally {
          setLoadingProject(false)
        }
      }
    }

    setOpen(prev => !prev)
  }

  const isDisabled = item.isMembers && !projectId

  return (
    <>
      <ListItemButton
        onClick={handleToggle}
        disabled={isDisabled}
        sx={{
          borderRadius: '12px',
          mx: 1,
          mb: 0.5,
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <item.icon />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            color: isDisabled ? 'text.disabled' : 'text.primary',
          }}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {loadingProject
            ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )
            : error
              ? (
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography color="error" variant="caption">
                      {error}
                    </Typography>
                  </Box>
                )
              : items.length === 0
                ? (
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
                        {item.isMembers ? 'Нет участников' : 'Нет элементов'}
                      </Typography>
                    </Box>
                  )
                : (
                    items.map((listItem) => {
                      if (item.isMembers) {
                        return (
                          <ListItemButton
                            key={listItem.id}
                            sx={{
                              borderRadius: '12px',
                              mx: 1,
                              mb: 0.5,
                              pl: 4,
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={listItem.member.firstName || listItem.member.lastName ? `${listItem.member.firstName} ${listItem.member.lastName}` : listItem.member.username}
                              secondary={listItem.member.email}
                            />
                          </ListItemButton>
                        )
                      }
                      else {
                        return (
                          <ListItemButton
                            key={listItem.id}
                            onClick={() => onNavigate(`${item.slug}/${listItem.id}`)}
                            selected={getLastProjectId() === listItem.id}
                            sx={{
                              borderRadius: '12px',
                              mx: 1,
                              mb: 0.5,
                              pl: 4,
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <FolderIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={listItem.name} />
                          </ListItemButton>
                        )
                      }
                    })
                  )}

          {item.button && (
            <ListItemButton
              onClick={() => {
                if (item.slug === '/projects') {
                  onCreateProject?.() // модалка для проекта
                }
                else if (item.isMembers) {
                  onAddMember?.()
                }
              }}
              disabled={item.isMembers && (!isAdmin || !projectId)}
              sx={{
                borderRadius: '12px',
                mx: 1,
                mb: 0.5,
                pl: 4,
                opacity: (item.isMembers && !projectId) ? 0.5 : 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.button.label}
                primaryTypographyProps={{
                  color: (item.isMembers && !projectId) ? 'text.disabled' : 'primary',
                }}
              />
            </ListItemButton>
          )}
        </List>
      </Collapse>
    </>
  )
}

export default CollapsibleSection
