import { useState } from 'react';
import { Typography, TextField, Button, IconButton, InputAdornment, CircularProgress, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Sign, {type AuthView} from '../Sign';
import base from '../../styles/formBase.module.css';

interface SignUpProps {
  onNavigate: (view: AuthView) => void;
}

const SignUp = ({ onNavigate }: SignUpProps) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next: Partial<typeof form> = {};
    if (!form.name.trim()) next.name = 'Введите имя';
    if (!form.email) next.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Некорректный email';
    if (!form.password) next.password = 'Введите пароль';
    else if (form.password.length < 8) next.password = 'Минимум 8 символов';
    if (form.password !== form.confirm) next.confirm = 'Пароли не совпадают';
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
      <Typography variant="h5" className={base.title}>Регистрация</Typography>
      <Typography className={base.subtitle}>Создайте аккаунт</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Имя"
          value={form.name}
          onChange={set('name')}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          className={base.field}
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          className={base.field}
        />
        <TextField
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={set('password')}
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
        <TextField
          label="Повторите пароль"
          type={showPassword ? 'text' : 'password'}
          value={form.confirm}
          onChange={set('confirm')}
          error={!!errors.confirm}
          helperText={errors.confirm}
          fullWidth
          className={base.field}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          className={base.submitButton}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Создать аккаунт'}
        </Button>
      </Box>

      <p className={base.footer}>
        Уже есть аккаунт?{' '}
        <span className={base.link} onClick={() => onNavigate('signIn')}>
          Войти
        </span>
      </p>
    </Sign>
  );
};

export default SignUp;
