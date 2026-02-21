export interface User {
  id: number
  name: string
  email: string
}

export interface ShareLinkItem {
  expires_at: string
}

export interface FileItem {
  id: number
  name: string
  size?: number
  mime_type?: string
  created_at?: string
  role?: 'owner' | 'viewer' | string
  shared_with?: number[]
  tags?: string[]
  share_links?: ShareLinkItem[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
}

/** Payload envoyé à l’API register (avec confirmation mot de passe) */
export interface RegisterPayload extends RegisterData {
  password_confirmation: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ShareResponse {
  share_link?: string
  message?: string
}
