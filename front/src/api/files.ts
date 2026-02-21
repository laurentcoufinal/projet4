import { apiClient } from './client'
import type { FileItem } from '@/types'

export const filesApi = {
  list: () => apiClient.get<{ data: FileItem[] }>('/files'),

  /** Envoie un fichier (champs: file, name, tags[]). Ne pas set Content-Type pour laisser axios ajouter le boundary. */
  upload: (formData: FormData) => apiClient.post<{ data: FileItem }>('/files', formData),

  download: (id: number) => apiClient.get(`/files/${id}/download`, { responseType: 'blob' }),

  delete: (id: number) => apiClient.delete(`/files/${id}`),

  /** Crée un lien de partage (réponse: { url, token, expires_at }). */
  shareLink: (id: number, expiresInDays = 7) =>
    apiClient.post<{ message?: string; url: string; token: string; expires_at?: string }>(
      `/files/${id}/share-link`,
      { expires_in_days: expiresInDays }
    ),

  share: (id: number, payload?: { email?: string; share_link?: boolean }) =>
    apiClient.post<{ data?: { share_link?: string } }>(`/files/${id}/share`, payload ?? {}),

  unshare: (id: number, userId: number) => apiClient.delete(`/files/${id}/share/${userId}`),
}
