import { Outlet, Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Layout = () => {
  // TODO: заменить на реальную проверку из store
  const isAuthenticated = false; // ЗАГЛУШКА

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  return <Outlet />;
};

export default Layout