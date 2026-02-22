import { useParams, Link } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import styles from './SharedFilePage.module.css'

function getApiBase(): string {
  const env = import.meta.env.VITE_API_BASE_URL
  if (typeof env === 'string' && env) return env
  if (globalThis.window === undefined) return '/api'
  return `${globalThis.window.location.origin}/api`
}
const apiBase = getApiBase()

export function SharedFilePage() {
  const { token } = useParams<{ token: string }>()

  const downloadUrl =
    token && apiBase ? `${apiBase.replace(/\/$/, '')}/v1/s/${encodeURIComponent(token)}` : null

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.section} aria-labelledby="shared-file-title">
          <h1 id="shared-file-title" className={`${styles.title} glass-text`}>
            Fichier partagé
          </h1>
          <p className={styles.subtitle}>
            Un fichier vous a été partagé via DataShare. Cliquez pour le télécharger.
          </p>
          {downloadUrl ? (
            <div className={styles.card}>
              <a
                href={downloadUrl}
                className={styles.downloadBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                Télécharger le fichier
              </a>
              <p className={styles.hint}>
                Le lien ouvre le téléchargement dans un nouvel onglet. Si rien ne se passe, vérifiez
                que le lien n’a pas expiré.
              </p>
            </div>
          ) : (
            <div className={styles.card}>
              <p className={styles.error}>Lien invalide ou expiré.</p>
              <Link to="/" className={styles.backLink}>
                Retour à l’accueil
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
