import useApi from "../../hooks/useApi.ts";
import type {CollapsibleSectionProps} from "./index.ts";
import {useState} from "react";
import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AddIcon from '@mui/icons-material/Add'


function CollapsibleSection({ item, onNavigate }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const api = useApi()

  function handleToggle() {
    if (!open && !items.length) {
      setLoading(true)
      api.get(item.slug)
        .then(setItems)
        .catch(() => {})
        .finally(() => setLoading(false))
    }

    setOpen(p => !p)
  }

  return (
    <>
      <ListItemButton
        onClick={handleToggle}
        sx={{ borderRadius: '12px', mx: 1, mb: 0.5 }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <item.icon />
        </ListItemIcon>
        <ListItemText primary={item.label} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          {loading
            ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )
            : items.map(listItem => (
              <ListItemButton
                key={listItem.id}
                onClick={() => onNavigate(`${item.slug}/${listItem.id}`)}
                sx={{ borderRadius: '12px', mx: 1, mb: 0.5, pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FolderOpenIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={listItem.name} />
              </ListItemButton>
            ))}

          <ListItemButton
            onClick={() => onNavigate(item.button.path)}
            sx={{ borderRadius: '12px', mx: 1, mb: 0.5, pl: 4 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.button.label}
              primaryTypographyProps={{ color: 'primary' }}
            />
          </ListItemButton>
        </List>
      </Collapse>
    </>
  )
}

export default CollapsibleSection