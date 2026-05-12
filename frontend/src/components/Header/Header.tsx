import AccountCircle from '@mui/icons-material/AccountCircle'
import MenuIcon from '@mui/icons-material/Menu'
import Settings from '@mui/icons-material/Settings'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Logo from '../../assets/react.svg?react'
import { ROUTES } from '../../constants/routes.ts'
import liquidGlass from '../../styles/liquidGlass.module.css'
import HeaderNav from '../HeaderNav'
import { useUserStore } from '../../store/useUserStory'
import { useParams } from 'react-router-dom'
import styles from './style.module.css'

function Header() {
  const navigate = useNavigate()
  const [isShowNav, setShowNav] = useState(false)
  const { id } = useParams<{ id: string }>()
  const lastProjectId = useUserStore(state => state.lastProjectId)

  const handleDrawerToggle = () => {
    setShowNav(!isShowNav)
  }

  const handleSettingsClick = () => {
    if (!lastProjectId) return
    
    const currentPath = window.location.pathname
    const settingsPath = ROUTES.PROJECT_SETTINGS(lastProjectId)
    const boardPath = ROUTES.PROJECT_BOARD(lastProjectId)
    
    if (currentPath === settingsPath) {
      navigate(boardPath)
    } else {
      navigate(settingsPath)
    }
  }

  const isProjectOpen = Boolean(id == lastProjectId?.toString())

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        className={`${styles.header} ${liquidGlass.wrapper}`}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            onClick={async () => navigate('/')}
            sx={{
              flexGrow: 1,
              display: { xs: 'none', sm: 'block' },
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Диспетчер задач
          </Typography>

          <Box
            component={RouterLink}
            to="/"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Logo />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={async () => navigate(ROUTES.PROFILE)}
              startIcon={<AccountCircle />}
              sx={{ textTransform: 'none', borderRadius: '16px' }}
            >
              Профиль
            </Button>

            <IconButton 
              color="inherit" 
              aria-label="settings"
              onClick={handleSettingsClick}
              disabled={!isProjectOpen}
              sx={{
                opacity: isProjectOpen ? 1 : 0.4,
              }}
            >
              <Settings />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <HeaderNav
        open={isShowNav}
        onClose={() => setShowNav(false)}
      />
    </>
  )
}

export default Header