import useApi from "../../hooks/useApi.ts";
import type {CollapsibleSectionProps} from "./index.ts";
import {useState, useEffect} from "react";
import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import {useLocation} from "react-router-dom";


function CollapsibleSection({ item, onNavigate }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = useApi()
  const location = useLocation()

  const isProjectPage = location.pathname.match(/\/projects\/\d+(\/|$)/)
  
  const projectId = item.isMembers && isProjectPage 
    ? location.pathname.split('/')[2]
    : null

  useEffect(() => {
    if (item.isMembers) {
      setItems([])
      setOpen(false)
      setError(null)
    }
  }, [location.pathname, item.isMembers])

  async function handleToggle() {
    if (item.isMembers) {
      if (!isProjectPage || !projectId) {
        return
      }
      
      if (!open && !items.length) {
        setLoading(true)
        setError(null)
        try {
          const data = await api.get(`/projects/${projectId}/members`)
          setItems(data)
        } catch (err) {
          setError('Не удалось загрузить участников')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    } else {
      if (!open && !items.length) {
        setLoading(true)
        setError(null)
        try {
          const data = await api.get(item.slug)
          setItems(data)
        } catch (err) {
          setError('Не удалось загрузить данные')
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    }

    setOpen(p => !p)
  }

  const isDisabled = item.isMembers && !isProjectPage

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
            color: isDisabled ? 'text.disabled' : 'text.primary'
          }}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography color="error" variant="caption">
                {error}
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ px: 2, py: 1 }}>
              <Typography color="text.secondary" variant="body2">
                {item.isMembers ? 'Нет участников' : 'Нет элементов'}
              </Typography>
            </Box>
          ) : (
            items.map(listItem => (
              <ListItemButton
                key={listItem.id}
                sx={{ 
                  borderRadius: '12px', 
                  mx: 1, 
                  mb: 0.5, 
                  pl: 4 
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={listItem.username}
                  secondary={listItem.email}
                  primaryTypographyProps={{
                    variant: 'body2',
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                  }}
                />
              </ListItemButton>
            ))
          )}

          {item.button && (
            <ListItemButton
              onClick={() => onNavigate(item.button.path)}
              disabled={item.isMembers && !isProjectPage}
              sx={{ 
                borderRadius: '12px', 
                mx: 1, 
                mb: 0.5, 
                pl: 4,
                opacity: (item.isMembers && !isProjectPage) ? 0.5 : 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.button.label}
                primaryTypographyProps={{ 
                  color: (item.isMembers && !isProjectPage) ? 'text.disabled' : 'primary' 
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