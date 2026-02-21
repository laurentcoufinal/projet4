import { useRef } from 'react'
import { useIsAuthenticated } from '@/features/auth/auth-store'
import { DropZone } from '@/components/DropZone'
import { IconUpload } from '@/components/Icons'
import styles from './ShareFilesSection.module.css'

const MAX_FILE_SIZE_MB = 100

export function ShareFilesSection() {
  const isAuthenticated = useIsAuthenticated()
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <section
      ref={sectionRef}
      id="share-files"
      className={styles.section}
      aria-labelledby="share-files-title"
    >
      <h2 id="share-files-title" className={`${styles.title} glass-text`}>
        Partager des fichiers
      </h2>
      <br />
      <p className={`${styles.subtitle} glass-text`}>
        Uploadez vos fichiers et générez des liens de partage sécurisés
      </p>
      {isAuthenticated ? (
        <DropZone maxSizeMb={MAX_FILE_SIZE_MB} />
      ) : (
        <div className={styles.card}>
          <IconUpload className={styles.cardIcon} />
          <p className={styles.loginPrompt}>Connectez-vous pour déposer des fichiers.</p>
        </div>
      )}
      <p className={`${styles.hint} glass-text`}>
        Formats supportés : tous types de fichiers • Taille max : {MAX_FILE_SIZE_MB} MB par fichier
      </p>
    </section>
  )
}
