import type { SignInfoState } from '../../components/Sign'
import type { SignPasswordConfig } from '../../components/SignPassword'

export type AuthRoute = 'default' | 'verifyEmail' | 'resetPassword' | 'acceptInvitation'

export const VERIFY_EMAIL_ENDPOINT = '/auth/verify-email'

export const DEFAULT_INFO: SignInfoState = {
  title: 'Готово',
  message: 'Действие выполнено успешно.',
}

export const VERIFY_EMAIL_LOADING_INFO: SignInfoState = {
  title: 'Подтверждаем email',
  message: 'Проверяем ссылку подтверждения. Это займет пару секунд.',
  actionLabel: 'Вернуться',
}

export const VERIFY_EMAIL_TOKEN_MISSING_INFO: SignInfoState = {
  title: 'Ссылка недействительна',
  message: 'В ссылке подтверждения не хватает токена. Попробуйте запросить письмо еще раз.',
  actionLabel: 'Вернуться',
}

export const VERIFY_EMAIL_SUCCESS_INFO: SignInfoState = {
  title: 'Email подтвержден',
  message: 'Аккаунт активирован. Теперь можно войти с вашим email и паролем.',
  actionLabel: 'Войти',
}

export const VERIFY_EMAIL_ERROR_INFO: SignInfoState = {
  title: 'Не удалось подтвердить email',
  message: 'Ссылка подтверждения недействительна или устарела.',
  actionLabel: 'Вернуться',
}

export const RESET_PASSWORD_CONFIG: SignPasswordConfig = {
  endpoint: '/auth/password-reset/confirm',
  title: 'Новый пароль',
  subtitle: 'Придумайте новый пароль и подтвердите его.',
  submitLabel: 'Сохранить пароль',
  successMessage: 'Пароль обновлен. Теперь можно войти.',
}

export const RESET_PASSWORD_TOKEN_MISSING_INFO: SignInfoState = {
  title: 'Ссылка недействительна',
  message: 'В ссылке восстановления пароля не хватает токена.',
  actionLabel: 'Вернуться',
}

export const ACCEPT_INVITATION_CONFIG: SignPasswordConfig = {
  endpoint: '/auth/project-invitations/accept',
  title: 'Принять приглашение',
  subtitle: 'Придумайте пароль, чтобы завершить регистрацию и войти в проект.',
  submitLabel: 'Принять приглашение',
  successMessage: 'Приглашение принято. Теперь можно войти.',
}

export const ACCEPT_INVITATION_TOKEN_MISSING_INFO: SignInfoState = {
  title: 'Ссылка недействительна',
  message: 'В ссылке приглашения не хватает токена.',
  actionLabel: 'Вернуться',
}

export function getAuthRoute(pathname: string): AuthRoute {
  const path = pathname.replace(/\/+$/, '')

  if (path.endsWith('/verify-email')) {
    return 'verifyEmail'
  }

  if (path.endsWith('/reset-password')) {
    return 'resetPassword'
  }

  if (path.endsWith('/accept-invitation')) {
    return 'acceptInvitation'
  }

  return 'default'
}

export { default } from './AuthPage.tsx'
