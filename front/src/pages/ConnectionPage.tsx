import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/features/auth/auth-store'
import { authApi } from '@/api/auth'
import { getApiErrorMessage } from '@/features/auth/api-errors'
import type { LoginCredentials } from '@/types'
import styles from './ConnectionPage.module.css'

/** Page Connexion – Figma node 9764-313 (DataShare). */
export function ConnectionPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.token, data.user)
      // #region agent log
      fetch('http://127.0.0.1:7248/ingest/cb806554-8ec7-4c00-9fa8-3db4a83cc406', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'a4ccaf',
        },
        body: JSON.stringify({
          sessionId: 'a4ccaf',
          location: 'ConnectionPage.tsx:handleSubmit',
          message: 'login ok, calling navigate partager',
          data: { hasToken: !!data?.token, hasUser: !!data?.user },
          timestamp: Date.now(),
          hypothesisId: 'H1',
        }),
      }).catch(() => {})
      // #endregion
      navigate('/partager', { replace: true })
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erreur de connexion'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header variant="hero" />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Connexion</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>
              Email{' '}
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
              Mot de passe{' '}
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Saisissez votre mot de passe..."
                required
                autoComplete="current-password"
                className={styles.input}
              />
            </label>
            <div className={styles.linkWrap}>
              <Link to="/inscription" className={styles.link}>
                Créer un compte
              </Link>
            </div>
            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Connexion…' : 'Connexion'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
