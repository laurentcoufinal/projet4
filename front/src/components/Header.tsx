import { Link } from 'react-router-dom'
import { useAuthStore, useIsAuthenticated } from '@/features/auth/auth-store'
import { IconShareLogo, IconUpload, IconList, IconUser } from './Icons'
import styles from './Header.module.css'

interface HeaderProps {
  /** 'hero' = uniquement DataShare + Se connecter (Figma 9764-346). */
  readonly variant?: 'default' | 'hero' | 'partager'
  /** Pour variant="partager" : callback du bouton "Ajouter des fichiers". */
  readonly onAddFilesClick?: () => void
  /** Pour variant="partager" : callback du bouton "Déconnexion". */
  readonly onLogout?: () => void
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Header({ variant = 'default', onAddFilesClick, onLogout }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  const isHero = variant === 'hero'
  const isPartager = variant === 'partager'

  return (
    <header className={isHero ? `${styles.header} ${styles.headerHero}` : styles.header}>
      <Link to="/" className={styles.logo}>
        {!isHero && <IconShareLogo className={styles.logoIcon} />}
        <div>
          <div className={styles.logoTitle}>DataShare</div>
          {!isHero && !isPartager && <div className={styles.logoSubtitle}>Partagez vos fichiers en toute sécurité</div>}
        </div>
      </Link>
      <nav className={styles.nav}>
        {isPartager && isAuthenticated ? (
          <>
            {onAddFilesClick && (
              <button type="button" className={styles.navBtnPartagerAdd} onClick={onAddFilesClick}>
                <IconUpload className={styles.navIcon} />
                Ajouter des fichiers
              </button>
            )}
            <button type="button" className={styles.navBtnPartagerLogout} onClick={onLogout ?? logout}>
              <span className={styles.navBtnPartagerLogoutIcon} aria-hidden>
                <IconLogout />
              </span>
              {' '}
              Déconnexion
            </button>
          </>
        ) : !isHero && !isPartager && (
          <>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() =>
                document.getElementById('share-files')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <IconUpload className={styles.navIcon} />
              Upload
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() =>
                document.getElementById('my-files')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <IconList className={styles.navIcon} />
              Mes fichiers
            </button>
          </>
        )}
        {!isPartager && (isAuthenticated ? (
          <button type="button" className={styles.navBtn} onClick={logout}>
            <IconUser className={styles.navIcon} />
            Déconnexion {user?.name ? `(${user.name})` : ''}
          </button>
        ) : (
          <Link to="/connection" className={`${styles.navBtn} ${styles.navBtnConnect}`}>
            <IconUser className={styles.navIcon} />
            Se connecter
          </Link>
        ))}
        {isPartager && !isAuthenticated && (
          <Link to="/connection" className={`${styles.navBtn} ${styles.navBtnConnect}`}>
            <IconUser className={styles.navIcon} />
            Se connecter
          </Link>
        )}
      </nav>
    </header>
  )
}
