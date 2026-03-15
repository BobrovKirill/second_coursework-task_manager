import { CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import useApi, {type ApiErrorResponse} from '../../hooks/useApi.ts'
import { getToken } from '../../utils/cookie.ts'
import {useAlertModal} from "../AlertModal";
import styles from './style.module.css'
import Header from "../Header";
import {useUserStore} from "../../store/useUserStory.ts";

function Layout() {
  const user = useUserStore()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const { showAlertModal } = useAlertModal()

  useEffect(() => {
    if (!getToken()) {
      setIsAuthenticated(false)
      return
    }

    user.fetchUser()
      .then((fetchedUser) => {
        setIsAuthenticated(true)

        const userName = (fetchedUser?.firstName || fetchedUser?.lastName) ? `${fetchedUser?.lastName} ${fetchedUser?.firstName}` : fetchedUser?.username || 'Пользователь'
        showAlertModal({ title: 'Добро пожаловать', message: userName, type: 'success' })
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
