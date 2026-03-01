import { useState } from 'react';
import { Typography, TextField, Button, IconButton, InputAdornment, CircularProgress, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Sign, {type AuthView} from '../Sign';
import base from '../../styles/formBase.module.css';
import styles from './style.module.css';

interface SignInProps {
  onNavigate: (view: AuthView) => void;
}

const SignIn = ({ onNavigate }: SignInProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Некорректный email';
    if (!password) next.password = 'Введите пароль';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: вызов store/api
      await new Promise(r => setTimeout(r, 1000));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sign>
      <Typography variant="h5" className={base.title}>Вход</Typography>
      <Typography className={base.subtitle}>Введите данные для входа в аккаунт</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          className={base.field}
        />
        <TextField
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          className={base.field}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(p => !p)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box className={styles.row}>
          <span className={base.link} onClick={() => onNavigate('signRecovery')}>
            Забыли пароль?
          </span>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className={base.submitButton}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Войти'}
        </Button>
      </Box>

      <p className={base.footer}>
        Нет аккаунта?{' '}
        <span className={base.link} onClick={() => onNavigate('signUp')}>
          Зарегистрироваться
        </span>
      </p>
    </Sign>
  );
};

export default SignIn;
