import { useAuthStore, useIsAuthenticated } from '@/features/auth/auth-store'
import { useState } from 'react'
import { LoginModal } from '@/features/auth/LoginModal'
import { RegisterModal } from '@/features/auth/RegisterModal'
import { IconShareLogo, IconUpload, IconList, IconUser } from './Icons'
import styles from './Header.module.css'

export function Header() {
  const { user, logout } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleConnexion = () => {
    setShowLogin(true)
    setShowRegister(false)
  }

  const handleSwitchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  const closeModals = () => {
    setShowLogin(false)
    setShowRegister(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <IconShareLogo className={styles.logoIcon} />
        <div>
          <div className={styles.logoTitle}>FileShare</div>
          <div className={styles.logoSubtitle}>Partagez vos fichiers facilement</div>
        </div>
      </div>
      <nav className={styles.nav}>
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
        {isAuthenticated ? (
          <button type="button" className={styles.navBtn} onClick={logout}>
            <IconUser className={styles.navIcon} />
            Déconnexion {user?.name ? `(${user.name})` : ''}
          </button>
        ) : (
          <button type="button" className={styles.navBtn} onClick={handleConnexion}>
            <IconUser className={styles.navIcon} />
            Connexion
          </button>
        )}
      </nav>
      {showLogin && (
        <LoginModal onClose={closeModals} onSwitchToRegister={handleSwitchToRegister} />
      )}
      {showRegister && (
        <RegisterModal onClose={closeModals} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </header>
  )
}
