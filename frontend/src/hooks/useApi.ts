import { getToken } from '../utils/cookie.ts'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: unknown
  headers?: Record<string, string>
}

export interface ApiErrorResponse {
  status: number
  message: string
  raw?: unknown
  [key: string]: unknown
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, headers: extraHeaders } = options

  const token = getToken()

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let errorBody: any = null;

    try {
      errorBody = await response.json();
    } catch {
      // сервер вернул не JSON → берём текст
      const text = await response.text().catch(() => "");
      errorBody = { message: text || response.statusText };
    }

    const apiError = {
      status: response.status,
      message:
        errorBody.detail ||
        errorBody.message ||
        errorBody.error ||
        response.statusText ||
        "Что-то пошло не так...",
      raw: errorBody,
    } as ApiErrorResponse;

    throw apiError as ApiErrorResponse;
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function createApi() {
  return {
    async get(endpoint: string) {
      return request(endpoint)
    },

    async post(endpoint: string, body?: unknown) {
      return request(endpoint, { method: 'POST', body })
    },

    async put(endpoint: string, body?: unknown) {
      return request(endpoint, { method: 'PUT', body })
    },

    async patch(endpoint: string, body?: unknown) {
      return request(endpoint, { method: 'PATCH', body })
    },

    async delete(endpoint: string) {
      return request(endpoint, { method: 'DELETE' })
    },
  }
}

const useApi = () => createApi()

export default useApi
