import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/features/auth/auth-store'
import { authApi } from '@/api/auth'
import { getApiErrorMessage } from '@/features/auth/api-errors'
import type { RegisterData } from '@/types'
import styles from './InscriptionPage.module.css'

/** Page Créer un compte – Figma node 9764-329 (DataShare). */
export function InscriptionPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState<RegisterData>({ name: '', email: '', password: '' })
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    const name = form.name.trim() || form.email.split('@')[0] || 'Utilisateur'
    setLoading(true)
    try {
      const { data } = await authApi.register({
        ...form,
        name,
        password_confirmation: passwordConfirm,
      })
      setAuth(data.token, data.user)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Erreur lors de l'inscription"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header variant="hero" />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Créer un compte</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>
              Email
              {' '}
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Saisissez votre email..."
                required
                autoComplete="email"
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              Mot de passe
              {' '}
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Saisissez votre mot de passe..."
                required
                autoComplete="new-password"
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              Vérification du mot de passe
              {' '}
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Saisissez le à nouveau"
                required
                autoComplete="new-password"
                className={styles.input}
              />
            </label>
            <div className={styles.linkWrap}>
              <Link to="/connection" className={styles.link}>
                J'ai déjà un compte
              </Link>
            </div>
            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
