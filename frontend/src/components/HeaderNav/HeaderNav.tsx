import type { NavDrawerProps } from './index.ts'

import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMembersStore } from '../../store/useMemberStore.ts'
import { useUserStore } from '../../store/useUserStory.ts'
import CreateProjectModal from '../CreateProjectModal/index.ts'
import CollapsibleSection from '../HeaderNavCollaps/HeaderNavCollaps.tsx'
import MemberModal from '../MemberModal/MemberModal.tsx'
import { DRAWER_WIDTH, NAV_ITEMS } from './index.ts'

function HeaderNav({ open, onClose }: NavDrawerProps) {
  const { addMember } = useMembersStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { getLastProjectId, removeLastProjectId } = useUserStore()
  const lastProjectId = getLastProjectId()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)

  function handleNavClick(path: string) {
    if (path === '/') {
      removeLastProjectId()
    }

    navigate(path)
    onClose()
  }

  return (
    <>
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
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(80px) saturate(140%)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.25), inset 0 2px 2px rgba(255,255,255,0.6), inset 0 -4px 10px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Навигация
            </Typography>
            <IconButton sx={{ cursor: 'pointer' }} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <List sx={{ flex: 1, pt: 1 }}>
            {NAV_ITEMS.map(item => (
              'path' in item ? (
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
              ) : item.isBoard ? (
              // Особая обработка для доски
                <ListItemButton
                  key="board"
                  selected={location.pathname.includes('/board')}
                  onClick={() => {
                    const lastId = getLastProjectId()
                    if (lastId) {
                      navigate(`/projects/${lastId}`)
                      onClose()
                    }
                  }}
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    mb: 0.5,
                    opacity: !lastProjectId ? 0.5 : 1,
                  }}
                  disabled={!lastProjectId}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      color: !lastProjectId ? 'text.disabled' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              ) : (
                <CollapsibleSection
                  key={item.slug}
                  item={item}
                  onNavigate={handleNavClick}
                  onCreateProject={() => setIsCreateModalOpen(true)}
                  onAddMember={() => setIsAddMemberOpen(true)}
                />
              )
            ))}
          </List>
        </Box>
      </Drawer>

      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
        // чета добавить можно
        }}
      />

      <MemberModal
        projectId={lastProjectId!}
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAdded={() => { addMember(getLastProjectId()) }}
      />
    </>
  )
}

export default HeaderNav
