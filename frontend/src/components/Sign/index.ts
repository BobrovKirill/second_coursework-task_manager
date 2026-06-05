import type { ReactNode } from 'react'

export { default } from './Sign.tsx'

export type AuthView = 'signIn' | 'signUp' | 'signRecovery' | 'signInfo'

export interface SignInfoState {
  title: string
  message: string
  actionLabel?: string
}

export interface SignModalProps {
  children: ReactNode
}

export interface SingFormTypes {
  username?: string
  password: string
  email: string
  confirm?: string
}

export interface SingErrorFetchTypes {
  detail: string
}

interface ValidationRule<T> {
  field: keyof T
  check: (value: string, form: T) => boolean
  message: string
}

const rules: ValidationRule<SingFormTypes>[] = [
  {
    field: 'username',
    check: v => !!v.trim(),
    message: 'Введите имя',
  },
  {
    field: 'username',
    check: v => v.trim().length >= 3,
    message: 'Минимум 3 символа',
  },
  {
    field: 'email',
    check: v => !!v,
    message: 'Введите email',
  },
  {
    field: 'email',
    check: v => /\S[^\s@]*@\S+\.\S+/.test(v),
    message: 'Некорректный email',
  },
  {
    field: 'password',
    check: v => !!v,
    message: 'Введите пароль',
  },
  {
    field: 'password',
    check: v => v.length >= 8,
    message: 'Минимум 8 символов',
  },
  {
    field: 'confirm',
    check: (v, form) => v === form.password,
    message: 'Пароли не совпадают',
  },
]

export function validateSignUpForm(form: SingFormTypes) {
  return rules.reduce<Partial<SingFormTypes>>((errors, rule) => {
    if (!(rule.field in form) || errors[rule.field]) {
      return errors
    }

    const value = form[rule.field] ?? ''
    if (!rule.check(value, form)) {
      errors[rule.field] = rule.message
    }

    return errors
  }, {})
}
