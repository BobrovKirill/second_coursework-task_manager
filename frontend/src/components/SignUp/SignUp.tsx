import type { AuthView, SingErrorFetchTypes, SingFormTypes } from '../Sign'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import useApi, {type ApiErrorResponse} from '../../hooks/useApi.ts'
import base from '../../styles/formBase.module.css'
import { useAlertModal } from '../AlertModal'
import Sign, { validateSignUpForm } from '../Sign'

interface SignUpProps {
  onNavigate: (view: AuthView) => void
}

function SignUp({ onNavigate }: SignUpProps) {
  const [form, setForm] = useState<SingFormTypes>({ username: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const { showAlertModal } = useAlertModal()
  const api = useApi()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    const fields = validateSignUpForm(form)
    setErrors(fields)
    const isValidate = !Object.keys(fields).length

    if (!isValidate) {
      return
    }

    setLoading(true)
    try {
      await api.post('/users', form)
      showAlertModal({ title: 'Поздравляем!', message: 'Регистрация прошла успешно!', type: 'success' })
      onNavigate('signIn')
    }
    catch (error: ApiErrorResponse | unknown) {
      const message = error?.message || 'Что-то пошло не так...'
      showAlertModal({ title: 'Ошибка', message })
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Sign>
      <Typography variant="h5" className={base.title}>Регистрация</Typography>
      <Typography className={base.subtitle}>Создайте аккаунт</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Имя"
          value={form.username}
          onChange={set('username')}
          error={!!errors.username}
          helperText={errors.username}
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
        Уже есть аккаунт?
        {' '}
        <span className={base.link} onClick={() => onNavigate('signIn')}>
          Войти
        </span>
      </p>
    </Sign>
  )
}

export default SignUp
