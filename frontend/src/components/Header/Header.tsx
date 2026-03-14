import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import styles from './style.module.css'
import liquidGlass from '../../styles/liquidGlass.module.css'
import { useState } from 'react';
import Logo from '../../assets/react.svg?react'
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import HeaderNav from "../HeaderNav";


function Header() {
  const navigate = useNavigate();
  const [isShowNav, setShowNav] = useState(false);

  const handleDrawerToggle = () => {
    setShowNav(!isShowNav);
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        className={`${liquidGlass.wrapper} ${styles.header}`}
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
            onClick={() => navigate('/')}
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
              startIcon={<AccountCircle />}
              sx={{ textTransform: 'none', borderRadius: '16px' }}
            >
              Профиль
            </Button>

            <IconButton color="inherit" aria-label="settings">
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
