import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'
import { useLocation, useNavigate } from 'react-router-dom'
import {DRAWER_WIDTH, NAV_ITEMS, type NavDrawerProps} from "./index.ts";
import CollapsibleSection from "../HeaderNavCollaps/HeaderNavCollaps.tsx";



function HeaderNav({ open, onClose }: NavDrawerProps) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleNavClick(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        backdrop: {
          invisible: true,
        },
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          borderRadius: '0 20px 20px 0',
          border: '1px solid rgba(255,255,255,0.25)',
          top: '200px',
          bottom: '200px',
          height: 'auto',
          backgroundColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(80px) saturate(140%)",
          boxShadow:"0 40px 80px rgba(0,0,0,0.25), inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -4px 10px rgba(0,0,0,0.15)"
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Навигация
          </Typography>
          <IconButton sx={{cursor: 'pointer'}} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ flex: 1, pt: 1 }}>
          {NAV_ITEMS.map(item => (
            'path' in item
              ? (
                <ListItemButton
                  key={item.path}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavClick(item.path)}
                  sx={{ borderRadius: '12px', mx: 1, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              )
              : (
                <CollapsibleSection
                  key={item.slug}
                  item={item}
                  onNavigate={handleNavClick}
                />
              )
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default HeaderNav