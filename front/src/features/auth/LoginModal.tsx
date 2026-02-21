import { useState } from 'react'
import { useAuthStore } from './auth-store'
import { authApi } from '@/api/auth'
import { getApiErrorMessage } from './api-errors'
import type { LoginCredentials } from '@/types'
import styles from './AuthModal.module.css'

interface LoginModalProps {
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ onClose, onSwitchToRegister }: LoginModalProps) {
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.token, data.user)
      onClose()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erreur de connexion'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 id="login-title" className={styles.title}>
          Connexion
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.label}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Mot de passe
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </div>
        </form>
        <p className={styles.switch}>
          Pas encore de compte ?{' '}
          <button type="button" className={styles.linkBtn} onClick={onSwitchToRegister}>
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  )
}
