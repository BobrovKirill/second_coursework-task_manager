export { default } from './SignPassword'

export const PASSWORD_MIN_LENGTH = 8

export interface PasswordForm {
  password: string
  confirm: string
}

export interface SignPasswordConfig {
  endpoint: string
  title: string
  subtitle: string
  submitLabel: string
  successMessage: string
}

export interface SignPasswordProps {
  token: string
  config: SignPasswordConfig
  onSuccess: () => void
  onBack: () => void
}

export const DEFAULT_PASSWORD_FORM: PasswordForm = {
  password: '',
  confirm: '',
}

export function validatePasswordForm(form: PasswordForm) {
  const errors: Partial<PasswordForm> = {}

  if (!form.password) {
    errors.password = 'Введите пароль'
  }
  else if (form.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Минимум ${PASSWORD_MIN_LENGTH} символов`
  }

  if (!form.confirm) {
    errors.confirm = 'Повторите пароль'
  }
  else if (form.confirm !== form.password) {
    errors.confirm = 'Пароли не совпадают'
  }

  return errors
}
