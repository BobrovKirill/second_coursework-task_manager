import type { AuthView, SignInfoState } from '../Sign'

export const PASSWORD_RESET_REQUEST_ENDPOINT = '/auth/password-reset/request'

export const SIGN_RECOVERY_TEXT = {
  title: 'Восстановление пароля',
  subtitle: 'Отправим ссылку для сброса на ваш email',
  submitLabel: 'Отправить ссылку',
}

export const SIGN_RECOVERY_SUCCESS_INFO: SignInfoState = {
  title: 'Проверьте почту',
  message: 'Если этот email зарегистрирован, мы отправили ссылку для восстановления пароля.',
  actionLabel: 'Вернуться',
}

export const SIGN_RECOVERY_ERROR_MESSAGE = 'Не удалось отправить письмо'

export interface SignRecoveryProps {
  onNavigate: (view: AuthView) => void
  onInfo: (info: SignInfoState) => void
}

export function validateRecoveryEmail(email: string) {
  if (!email) {
    return 'Введите email'
  }

  if (!/\S[^\s@]*@\S+\.\S+/.test(email)) {
    return 'Некорректный email'
  }

  return ''
}

export { default } from './SignRecovery.tsx'
