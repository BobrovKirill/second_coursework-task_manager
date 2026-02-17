import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthPage, MainPage } from './pages';
import Layout from './components/Layout';
import { ROUTES } from './constants/routes';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.AUTH} element={<AuthPage />} />

          <Route element={<Layout />}>
            <Route path={ROUTES.MAIN} element={<MainPage />} />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.MAIN} replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;