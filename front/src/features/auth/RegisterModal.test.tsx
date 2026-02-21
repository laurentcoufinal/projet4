import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterModal } from './RegisterModal'
import { useAuthStore } from './auth-store'
import * as authApi from '@/api/auth'

vi.mock('@/api/auth')

describe('RegisterModal', () => {
  const onClose = vi.fn()
  const onSwitchToLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().logout()
  })

  it('affiche le titre Inscription et les champs nom, email, mot de passe, confirmation', () => {
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    expect(screen.getByRole('heading', { name: 'Inscription' })).toBeInTheDocument()
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^mot de passe$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmation du mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument()
  })

  it('appelle onClose au clic sur Annuler', async () => {
    const user = userEvent.setup()
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    await user.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('appelle onSwitchToLogin au clic sur Se connecter', async () => {
    const user = userEvent.setup()
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    await user.click(screen.getByRole('button', { name: /se connecter/i }))
    expect(onSwitchToLogin).toHaveBeenCalledTimes(1)
  })

  it('envoie le formulaire et met à jour le store puis appelle onClose en cas de succès', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 1, name: 'New User', email: 'new@example.com' }
    vi.mocked(authApi.authApi.register).mockResolvedValueOnce({
      data: { token: 'jwt-token', user: mockUser },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    await user.type(screen.getByLabelText(/^nom$/i), 'New User')
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^mot de passe$/i), 'secret')
    await user.type(screen.getByLabelText(/confirmation du mot de passe/i), 'secret')
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))
    expect(authApi.authApi.register).toHaveBeenCalledWith({
      name: 'New User',
      email: 'new@example.com',
      password: 'secret',
      password_confirmation: 'secret',
    })
    await vi.waitFor(() => {
      expect(useAuthStore.getState().token).toBe('jwt-token')
      expect(useAuthStore.getState().user).toEqual(mockUser)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    const user = userEvent.setup()
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    await user.type(screen.getByLabelText(/^nom$/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^mot de passe$/i), 'secret')
    await user.type(screen.getByLabelText(/confirmation du mot de passe/i), 'different')
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))
    expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument()
    expect(authApi.authApi.register).not.toHaveBeenCalled()
  })

  it("affiche une erreur en cas d'échec de l'API", async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.authApi.register).mockRejectedValueOnce({
      response: { data: { message: 'Email déjà utilisé' } },
    })
    render(<RegisterModal onClose={onClose} onSwitchToLogin={onSwitchToLogin} />)
    await user.type(screen.getByLabelText(/^nom$/i), 'Test')
    await user.type(screen.getByLabelText(/email/i), 'dup@example.com')
    await user.type(screen.getByLabelText(/^mot de passe$/i), 'pass')
    await user.type(screen.getByLabelText(/confirmation du mot de passe/i), 'pass')
    await user.click(screen.getByRole('button', { name: /s'inscrire/i }))
    await vi.waitFor(() => {
      expect(screen.getByText('Email déjà utilisé')).toBeInTheDocument()
    })
  })
})
