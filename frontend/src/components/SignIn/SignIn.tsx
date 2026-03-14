import type { SingErrorFetchTypes, SingFormTypes } from '../Sign'
import type { SignInProps } from './index.ts'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.ts'
import useApi, {type ApiErrorResponse} from '../../hooks/useApi.ts'
import base from '../../styles/formBase.module.css'
import { setToken } from '../../utils/cookie.ts'
import { useAlertModal } from '../AlertModal'
import Sign, { validateSignUpForm } from '../Sign'
import styles from './style.module.css'

function SignIn({ onNavigate }: SignInProps) {
  const [form, setForm] = useState<SingFormTypes>({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({})

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const { showAlertModal } = useAlertModal()
  const api = useApi()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    const fields = validateSignUpForm(form)
    setErrors(fields)
    const isValidate = !Object.keys(fields).length

    if (!isValidate) {
      return
    }

    setLoading(true)
    try {
      const { access_token = '' } = await api.post('/auth/login/', form)
      setToken(access_token)
      showAlertModal({ title: 'Успешно', message: 'авторизация прошла успешно!', type: 'success' })
      navigate(ROUTES.MAIN)
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
      <Typography variant="h5" className={base.title}>Вход</Typography>
      <Typography className={base.subtitle}>Введите данные для входа в аккаунт</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        Нет аккаунта?
        {' '}
        <span className={base.link} onClick={() => onNavigate('signUp')}>
          Зарегистрироваться
        </span>
      </p>
    </Sign>
  )
}

export default SignIn
