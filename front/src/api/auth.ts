import { apiClient } from './client'
import type { LoginCredentials, RegisterPayload, AuthResponse } from '@/types'

export const authApi = {
  login: (credentials: LoginCredentials) => apiClient.post<AuthResponse>('/login', credentials),

  register: (data: RegisterPayload) => apiClient.post<AuthResponse>('/register', data),

  logout: () => apiClient.post('/logout'),

  getCurrentUser: () => apiClient.get<{ data: import('@/types').User }>('/user'),
}
