import axios from 'axios'
import { useAuthStore } from '@/features/auth/auth-store'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: `${baseURL}/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/cb806554-8ec7-4c00-9fa8-3db4a83cc406', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'a4ccaf',
        },
        body: JSON.stringify({
          sessionId: 'a4ccaf',
          location: 'client.ts:response interceptor',
          message: '401 triggering logout',
          data: {
            reqUrl: error.config?.url,
            method: error.config?.method,
          },
          timestamp: Date.now(),
          hypothesisId: 'H5',
        }),
      }).catch(() => {})
      // #endregion
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
