import { useIsAuthenticated } from '@/features/auth/auth-store'
import { FileList } from '@/components/FileList'
import styles from './MyFilesSection.module.css'

export function MyFilesSection() {
  const isAuthenticated = useIsAuthenticated()

  return (
    <section id="my-files" className={styles.section} aria-labelledby="my-files-title">
      <h2 id="my-files-title" className={`${styles.title} glass-text`}>
        Mes fichiers
      </h2>
      <br />
      {isAuthenticated ? (
        <>
          <FileList />
        </>
      ) : (
        <div className={styles.card}>
          <p className={styles.loginPrompt}>Connectez-vous pour voir vos fichiers.</p>
        </div>
      )}
    </section>
  )
}
