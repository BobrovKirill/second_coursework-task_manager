import type { AuthView, SingFormTypes } from '../Sign'

export const SIGN_IN_ENDPOINT = '/auth/login'

export const SIGN_IN_TEXT = {
  title: 'Вход',
  subtitle: 'Введите данные для входа в аккаунт',
  forgotPasswordLabel: 'Забыли пароль?',
  submitLabel: 'Войти',
  footerText: 'Нет аккаунта?',
  signUpLabel: 'Зарегистрироваться',
}

export const SIGN_IN_INITIAL_FORM: SingFormTypes = {
  email: '',
  password: '',
}

export const SIGN_IN_SUCCESS_ALERT = {
  title: 'Успешно',
  message: 'авторизация прошла успешно!',
  type: 'success' as const,
}

export const SIGN_IN_ERROR_MESSAGE = 'Что-то пошло не так...'

export interface SignInProps {
  onNavigate: (view: AuthView) => void
}

export { default } from './SignIn.tsx'
