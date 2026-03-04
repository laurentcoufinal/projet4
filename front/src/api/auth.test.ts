import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './auth'
import { apiClient } from './client'

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authApi', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.get).mockReset()
  })

  it('login appelle POST /login avec les credentials', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { token: 't', user: {} } })
    await authApi.login({ email: 'a@b.c', password: 'secret' })
    expect(apiClient.post).toHaveBeenCalledWith('/login', {
      email: 'a@b.c',
      password: 'secret',
    })
  })

  it('register appelle POST /register avec le payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { token: 't', user: {} } })
    await authApi.register({
      name: 'User',
      email: 'u@u.u',
      password: 'pass',
      password_confirmation: 'pass',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/register', {
      name: 'User',
      email: 'u@u.u',
      password: 'pass',
      password_confirmation: 'pass',
    })
  })

  it('logout appelle POST /logout', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({})
    await authApi.logout()
    expect(apiClient.post).toHaveBeenCalledWith('/logout')
  })

  it('getCurrentUser appelle GET /user', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: { id: 1, name: 'U', email: 'u@u' } } })
    await authApi.getCurrentUser()
    expect(apiClient.get).toHaveBeenCalledWith('/user')
  })
})
