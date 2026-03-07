import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi.ts'
import { getToken } from '../../utils/cookie.ts'

function Layout() {
  const api = useApi()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    if (!getToken()) {
      setIsAuthenticated(false)
      return
    }

    api.get('/users/me')
      .then((user) => {
        // TODO: тут потом реализовать логику переноса user'a в store
        console.log(user)
        setIsAuthenticated(true)
      })
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) {
    return <CircularProgress />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  return <Outlet />
}

export default Layout
