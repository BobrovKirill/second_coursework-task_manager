import type { AuthView, SignInfoState, SingFormTypes } from '../Sign'

export const SIGN_UP_ENDPOINT = '/users/'

export const SIGN_UP_TEXT = {
  title: 'Регистрация',
  subtitle: 'Создайте аккаунт',
  submitLabel: 'Создать аккаунт',
  footerText: 'Уже есть аккаунт?',
  signInLabel: 'Войти',
}

export const SIGN_UP_INITIAL_FORM: SingFormTypes = {
  username: '',
  email: '',
  password: '',
  confirm: '',
}

export const SIGN_UP_SUCCESS_INFO: SignInfoState = {
  title: 'Проверьте почту',
  message: 'Мы отправили письмо для подтверждения регистрации. После подтверждения email можно войти в аккаунт.',
  actionLabel: 'Вернуться',
}

export const SIGN_UP_ERROR_MESSAGE = 'Что-то пошло не так...'

export interface SignUpProps {
  onNavigate: (view: AuthView) => void
  onInfo: (info: SignInfoState) => void
}

export { default } from './SignUp.tsx'
