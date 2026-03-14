import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import useApi, {type ApiErrorResponse} from '../../hooks/useApi.ts'
import { getToken } from '../../utils/cookie.ts'
import {useAlertModal} from "../AlertModal";
import styles from './style.module.css'
import Header from "../Header";

function Layout() {
  const api = useApi()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { showAlertModal } = useAlertModal()

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
      .catch((error: ApiErrorResponse) => {
        setIsAuthenticated(false)

        showAlertModal({ title: 'Ошибка', message: error.message })
      })
  }, [])

  if (isAuthenticated === null) {
    return <CircularProgress />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH} replace />
  }

  return (
    <main className={ styles.layout }>
      <Header />

      <Outlet />
    </main>
  )
}

export default Layout
