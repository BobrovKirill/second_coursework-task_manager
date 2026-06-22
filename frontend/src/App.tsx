import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import { ROUTES } from './constants/routes'
import AuthPage from './pages/AuthPage'
import Board from './pages/Board/Board'
import CreateTaskPage from './pages/CreateTaskPage'
import EditTaskPage from './pages/EditTaskPage'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import ProjectPage from './pages/ProjectPage'
import ProjectSettingsPage from './pages/ProjectSettingsPage'
import styles from './styles/app.module.css'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function AppBackground({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({})
  
  useEffect(() => {
    const handleBgUpdate = (event: CustomEvent) => {
      setBackgroundStyle(event.detail || {})
    }

    window.addEventListener('updateAppBackground', handleBgUpdate as EventListener)
    
    return () => {
      window.removeEventListener('updateAppBackground', handleBgUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    const isProjectPage = /^\/projects\/\d+/.test(location.pathname)
    if (!isProjectPage) {
      setBackgroundStyle({})
    }
  }, [location.pathname])

  return (
    <div className={styles.app} style={backgroundStyle}>
      {children}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBackground>
          <Routes>
            <Route path={ROUTES.AUTH_PATTERN} element={<AuthPage />} />

            <Route element={<Layout />}>
              <Route path={ROUTES.MAIN} element={<MainPage />} />

              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.CREATE_TASK_PATTERN} element={<CreateTaskPage />} />
              <Route path={ROUTES.EDIT_TASK_PATTERN} element={<EditTaskPage />} />

              <Route path={ROUTES.PROJECT_DETAIL(':id')} element={<ProjectPage />}>
                <Route index element={<Board />} />
                <Route path="board" element={<Board />} />
                <Route path="settings" element={<ProjectSettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.MAIN} replace />} />
          </Routes>
        </AppBackground>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App