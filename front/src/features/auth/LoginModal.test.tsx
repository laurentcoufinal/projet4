import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from './LoginModal'
import { useAuthStore } from './auth-store'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth')

describe('LoginModal', () => {
  const onClose = vi.fn()
  const onSwitchToRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  it('affiche le titre Connexion et les champs email / mot de passe', () => {
    render(<LoginModal onClose={onClose} onSwitchToRegister={onSwitchToRegister} />)
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('appelle onClose au clic sur Annuler', async () => {
    const user = userEvent.setup()
    render(<LoginModal onClose={onClose} onSwitchToRegister={onSwitchToRegister} />)
    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("appelle onSwitchToRegister au clic sur S'inscrire", async () => {
    const user = userEvent.setup()
    render(<LoginModal onClose={onClose} onSwitchToRegister={onSwitchToRegister} />)
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))
    expect(onSwitchToRegister).toHaveBeenCalledTimes(1)
  })

  it('envoie le formulaire et met à jour le store puis appelle onClose en cas de succès', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 1, name: 'Test', email: 'test@example.com' }
    vi.mocked(authApi.authApi.login).mockResolvedValueOnce({
      data: { token: 'jwt-token', user: mockUser },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<LoginModal onClose={onClose} onSwitchToRegister={onSwitchToRegister} />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/mot de passe/i), 'password')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(authApi.authApi.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    })
    await vi.waitFor(() => {
      expect(useAuthStore.getState().token).toBe('jwt-token')
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it("affiche une erreur en cas d'échec de l'API", async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.authApi.login).mockRejectedValueOnce({
      response: { data: { message: 'Identifiants invalides' } },
    })
    render(<LoginModal onClose={onClose} onSwitchToRegister={onSwitchToRegister} />)
    await user.type(screen.getByLabelText(/email/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/mot de passe/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /se connecter/i }))
    await vi.waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument()
    })
  })
})
