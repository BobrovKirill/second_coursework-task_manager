import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ROUTES } from './constants/routes'
import AuthPage from './pages/AuthPage'
import MainPage from './pages/MainPage'
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
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.MAIN} replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App
