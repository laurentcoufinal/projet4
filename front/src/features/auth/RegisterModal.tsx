import { useState } from 'react'
import { useAuthStore } from './auth-store'
import { authApi } from '@/api/auth'
import { getApiErrorMessage } from './api-errors'
import type { RegisterData } from '@/types'
import styles from './AuthModal.module.css'

interface RegisterModalProps {
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ onClose, onSwitchToLogin }: RegisterModalProps) {
  const [form, setForm] = useState<RegisterData>({ name: '', email: '', password: '' })
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.register({ ...form, password_confirmation: passwordConfirm })
      setAuth(data.token, data.user)
      onClose()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Erreur lors de l'inscription"))
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
      aria-labelledby="register-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 id="register-title" className={styles.title}>
          Inscription
        </h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.label}>
            Nom
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              autoComplete="name"
              className={styles.input}
            />
          </label>
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
              autoComplete="new-password"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Confirmation du mot de passe
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className={styles.input}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? 'Inscription…' : "S'inscrire"}
            </button>
          </div>
        </form>
        <p className={styles.switch}>
          Déjà un compte ?{' '}
          <button type="button" className={styles.linkBtn} onClick={onSwitchToLogin}>
            Se connecter
          </button>
        </p>
      </div>
    </div>
  )
}
