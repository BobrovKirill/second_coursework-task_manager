import type { AuthView, SignInfoState } from '../../components/Sign'
import type { ApiErrorResponse } from '../../hooks/useApi'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SignIn from '../../components/SignIn/SignIn'
import SignInfo from '../../components/SignInfo'
import SignPassword from '../../components/SignPassword'
import SignRecovery from '../../components/SignRecovery/SignRecovery'
import SignUp from '../../components/SignUp/SignUp'
import { ROUTES } from '../../constants/routes'
import useApi from '../../hooks/useApi'
import {
  ACCEPT_INVITATION_CONFIG,
  ACCEPT_INVITATION_TOKEN_MISSING_INFO,
  DEFAULT_INFO,
  RESET_PASSWORD_CONFIG,
  RESET_PASSWORD_TOKEN_MISSING_INFO,
  VERIFY_EMAIL_ENDPOINT,
  VERIFY_EMAIL_ERROR_INFO,
  VERIFY_EMAIL_LOADING_INFO,
  VERIFY_EMAIL_SUCCESS_INFO,
  VERIFY_EMAIL_TOKEN_MISSING_INFO,
  getAuthRoute,
} from './index'
import styles from './style.module.css'

function AuthPage() {
  const [view, setView] = useState<AuthView>('signIn')
  const [info, setInfo] = useState<SignInfoState>(DEFAULT_INFO)
  const location = useLocation()
  const navigate = useNavigate()
  const api = useApi()
  const verificationKeyRef = useRef<string | null>(null)

  const authRoute = getAuthRoute(location.pathname)
  const token = new URLSearchParams(location.search).get('token') ?? ''

  const goToSignIn = () => {
    setView('signIn')
    void navigate(ROUTES.AUTH, { replace: true })
  }

  const showInfo = (nextInfo: SignInfoState) => {
    setInfo(nextInfo)
    setView('signInfo')
    void navigate(ROUTES.AUTH, { replace: true })
  }

  useEffect(() => {
    if (authRoute !== 'verifyEmail') {
      return
    }

    const verificationKey = `${location.pathname}?${token}`
    if (verificationKeyRef.current === verificationKey) {
      return
    }

    verificationKeyRef.current = verificationKey

    if (!token) {
      showInfo(VERIFY_EMAIL_TOKEN_MISSING_INFO)
      return
    }

    api.post(VERIFY_EMAIL_ENDPOINT, { token })
      .then(() => {
        showInfo(VERIFY_EMAIL_SUCCESS_INFO)
      })
      .catch((error: ApiErrorResponse | unknown) => {
        const message = (error as ApiErrorResponse)?.message || VERIFY_EMAIL_ERROR_INFO.message
        showInfo({
          title: VERIFY_EMAIL_ERROR_INFO.title,
          message,
          actionLabel: VERIFY_EMAIL_ERROR_INFO.actionLabel,
        })
      })
  }, [authRoute, location.pathname, token])

  if (authRoute === 'verifyEmail') {
    return (
      <div className={styles.root}>
        <SignInfo
          info={VERIFY_EMAIL_LOADING_INFO}
          onAction={goToSignIn}
        />
      </div>
    )
  }

  if (authRoute === 'resetPassword') {
    return (
      <div className={styles.root}>
        {token
          ? (
              <SignPassword
                token={token}
                config={RESET_PASSWORD_CONFIG}
                onSuccess={goToSignIn}
                onBack={goToSignIn}
              />
            )
          : (
              <SignInfo
                info={RESET_PASSWORD_TOKEN_MISSING_INFO}
                onAction={goToSignIn}
              />
            )}
      </div>
    )
  }

  if (authRoute === 'acceptInvitation') {
    return (
      <div className={styles.root}>
        {token
          ? (
              <SignPassword
                token={token}
                config={ACCEPT_INVITATION_CONFIG}
                onSuccess={goToSignIn}
                onBack={goToSignIn}
              />
            )
          : (
              <SignInfo
                info={ACCEPT_INVITATION_TOKEN_MISSING_INFO}
                onAction={goToSignIn}
              />
            )}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {view === 'signIn' && <SignIn onNavigate={setView} />}
      {view === 'signUp' && <SignUp onNavigate={setView} onInfo={showInfo} />}
      {view === 'signRecovery' && <SignRecovery onNavigate={setView} onInfo={showInfo} />}
      {view === 'signInfo' && (
        <SignInfo
          info={info}
          onAction={goToSignIn}
        />
      )}
    </div>
  )
}

export default AuthPage
