import type { AuthView } from '../../components/Sign'
import { useState } from 'react'
import SignIn from '../../components/SignIn/SignIn'
import SignRecovery from '../../components/SignRecovery/SignRecovery'
import SignUp from '../../components/SignUp/SignUp'
import styles from './style.module.css'

function AuthPage() {
  const [view, setView] = useState<AuthView>('signIn')

  return (
    <div className={styles.root}>
      {view === 'signIn' && <SignIn onNavigate={setView} />}
      {view === 'signUp' && <SignUp onNavigate={setView} />}
      {view === 'signRecovery' && <SignRecovery onNavigate={setView} />}
    </div>
  )
}

export default AuthPage
