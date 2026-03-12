import axios from 'axios'
import type { 
  Project, 
  ProjectCreate, 
  ProjectUpdate,
  ProjectWithMembers,
  ProjectListItem 
} from '../types/project'
import type { User } from '../types/user'
import { getToken } from '../utils/cookie'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Токен добавлен к запросу из cookie')
  } else {
    console.log('Токен не найден в cookie')
  }
  return config
})


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Ошибка авторизации:', error.response.data)
    }
    return Promise.reject(error)
  }
)

export const projectsApi = {
  getAll: () => apiClient.get<ProjectListItem[]>('/projects'),
  
  getById: (id: number) => apiClient.get<ProjectWithMembers>(`/projects/${id}`),
  
  create: (data: ProjectCreate) => apiClient.post<Project>('/projects', data),
  
  update: (id: number, data: ProjectUpdate) => 
    apiClient.put<Project>(`/projects/${id}`, data),
  
  delete: (id: number) => apiClient.delete(`/projects/${id}`),
  
  getMembers: (projectId: number) => 
    apiClient.get<User[]>(`/projects/${projectId}/members`),
  
  addMember: (projectId: number, userId: number) => 
    apiClient.post<User>(`/projects/${projectId}/members/${userId}`),
  
  removeMember: (projectId: number, userId: number) => 
    apiClient.delete(`/projects/${projectId}/members/${userId}`),
  
  getCurrentUser: () => apiClient.get<User>('/users/me')
}