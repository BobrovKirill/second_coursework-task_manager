import { useState } from 'react';
import SignIn from '../../components/SignIn/SignIn';
import SignUp from '../../components/SignUp/SignUp';
import SignRecovery from '../../components/SignRecovery/SignRecovery';
import styles from './style.module.css';
import type {AuthView} from "../../components/Sign";


const AuthPage = () => {
  const [view, setView] = useState<AuthView>('signIn');

  return (
    <div className={styles.root}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      {view === 'signIn' && <SignIn onNavigate={setView} />}
      {view === 'signUp' && <SignUp onNavigate={setView} />}
      {view === 'signRecovery' && <SignRecovery onNavigate={setView} />}
    </div>
  );
};

export default AuthPage;
