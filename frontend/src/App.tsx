import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ROUTES } from './constants/routes'
import AuthPage from './pages/AuthPage'
import Board from './pages/Board/Board'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import ProjectPage from './pages/ProjectPage'
import styles from './styles/app.module.css'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={styles.app}>
        <BrowserRouter>
          <Routes>
            <Route path={ROUTES.AUTH} element={<AuthPage />} />

            <Route element={<Layout />}>
              <Route path={ROUTES.MAIN} element={<MainPage />} />

              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

              <Route path={ROUTES.PROJECT_DETAIL(':id')} element={<ProjectPage />}>
                <Route index element={<Board />} />
                <Route path="board" element={<Board />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.MAIN} replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App
