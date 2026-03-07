import { getToken } from '../utils/cookie.ts'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: RequestMethod
  body?: unknown
  headers?: Record<string, string>
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
    const message = await response.text().catch(() => response.statusText)
    throw new Error(message)
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
