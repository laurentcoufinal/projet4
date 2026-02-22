import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, useIsAuthenticated } from '@/features/auth/auth-store'
import { useFiles, filesQueryKey } from '@/hooks/useFiles'
import { useIsMobileView } from '@/hooks/useMediaQuery'
import { filesApi } from '@/api/files'
import { getExpirationStatus } from '@/features/files/mesFichiersUtils'
import { MesFileRow } from '@/features/files/MesFileRow'
import { AddFilesModal } from '@/features/files/AddFilesModal'
import { DownloadFileModalWithPassword } from '@/features/files/DownloadFileModalWithPassword'
import { DeleteConfirmModal } from '@/features/files/DeleteConfirmModal'
import { ShareLinkModal } from '@/features/files/ShareLinkModal'
import { IconList } from '@/components/Icons'
import type { FileItem } from '@/types'
import styles from './PartagerPage.module.css'

type TabValue = 'all' | 'active' | 'expired'

function getEmptyMessage(t: TabValue): string {
  if (t === 'all') return 'Aucun fichier pour le moment.'
  if (t === 'active') return 'Aucun fichier actif.'
  return 'Aucun fichier expiré.'
}

function getTabClassName(active: boolean, styles: { tab: string; tabActive: string }): string {
  return active ? `${styles.tab} ${styles.tabActive}` : styles.tab
}

function isOwner(file: FileItem): boolean {
  return (file.role ?? 'owner') === 'owner'
}

export function PartagerPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout, user } = useAuthStore()
  const isAuthenticated = useIsAuthenticated()
  const isMobileView = useIsMobileView()
  const { data: files = [], isLoading, error } = useFiles()
  const [tab, setTab] = useState<TabValue>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFilesModalOpen, setMobileFilesModalOpen] = useState(true)
  const [downloadFileWithPassword, setDownloadFileWithPassword] = useState<FileItem | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null)
  const [fileForShareLink, setFileForShareLink] = useState<FileItem | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (fileId: number) => filesApi.delete(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey })
      setFileToDelete(null)
    },
  })

  const myFiles = useMemo(() => files.filter(isOwner), [files])

  const filteredFiles = useMemo(() => {
    if (tab === 'all') return myFiles
    if (tab === 'active')
      return myFiles.filter(
        (f) => getExpirationStatus(f) === 'active' || getExpirationStatus(f) === 'none'
      )
    return myFiles.filter((f) => getExpirationStatus(f) === 'expired')
  }, [myFiles, tab])

  function renderFileListContent() {
    if (isLoading) return <p className={styles.emptyState}>Chargement…</p>
    if (error) return <p className={styles.emptyState}>Erreur lors du chargement des fichiers.</p>
    if (filteredFiles.length === 0)
      return <p className={styles.emptyState}>{getEmptyMessage(tab)}</p>
    return (
      <ul className={styles.fileList}>
        {filteredFiles.map((file) => (
          <MesFileRow
            key={file.id}
            file={file}
            onAccess={(f) => setDownloadFileWithPassword(f)}
            onDeleteRequest={(f) => setFileToDelete(f)}
            onLinkRequest={(f) => setFileForShareLink(f)}
            isDeleting={fileToDelete?.id === file.id && deleteMutation.isPending}
          />
        ))}
      </ul>
    )
  }

  const handleLogout = () => {
    setMobileMenuOpen(false)
    setMobileFilesModalOpen(false)
    logout()
    navigate('/')
  }

  const closeMobileFilesModal = () => {
    setMobileFilesModalOpen(false)
  }

  useEffect(() => {
    if (isMobileView) setMobileFilesModalOpen(true)
  }, [isMobileView])

  const mainContent = (
    <>
      <h1 className={styles.mainTitle}>Mes fichiers</h1>

      {isAuthenticated ? (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Filtrer les fichiers">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'all'}
              className={getTabClassName(tab === 'all', styles)}
              onClick={() => setTab('all')}
            >
              Tous
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'active'}
              className={getTabClassName(tab === 'active', styles)}
              onClick={() => setTab('active')}
            >
              Actifs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'expired'}
              className={getTabClassName(tab === 'expired', styles)}
              onClick={() => setTab('expired')}
            >
              Expiré
            </button>
          </div>

          <div className={styles.fileListCard}>{renderFileListContent()}</div>
        </>
      ) : (
        <div className={styles.fileListCard}>
          <p className={styles.loginPrompt}>Connectez-vous pour voir et gérer vos fichiers.</p>
        </div>
      )}
    </>
  )

  return (
    <div className={styles.layout}>
      <div className={styles.layoutBody}>
        {!isMobileView && (
          <aside className={styles.sidebar}>
            <Link to="/" className={styles.sidebarLogo}>
              DataShare
            </Link>
            <nav className={styles.sidebarNav} aria-label="Navigation principale">
              <span className={styles.sidebarNavItem} aria-current="page">
                Mes fichiers
              </span>
            </nav>
            <footer className={styles.sidebarFooter}>
              <span>
                Copyright DataShare<sup>©</sup> 2025
              </span>
            </footer>
          </aside>
        )}

        <div className={styles.contentColumn}>
          {isMobileView ? (
            <>
              <header className={styles.mobileHeader} aria-label="En-tête mobile">
                <button
                  type="button"
                  className={styles.mobileMenuBtn}
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Ouvrir le menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <IconList className={styles.mobileMenuIcon} />
                </button>
                <div className={styles.mobileProfile}>
                  {isAuthenticated && user ? (
                    <>
                      <span className={styles.mobileAvatar} aria-hidden>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className={styles.mobileProfileName}>{user.name}</span>
                    </>
                  ) : (
                    <Link to="/connection" className={styles.mobileProfileName}>
                      Connexion
                    </Link>
                  )}
                </div>
              </header>
              {mobileMenuOpen && (
                <button
                  type="button"
                  className={styles.mobileOverlay}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                />
              )}
              <nav
                className={styles.mobileDrawer}
                aria-label="Menu principal"
                aria-hidden={!mobileMenuOpen}
                data-open={mobileMenuOpen}
              >
                <Link
                  to="/"
                  className={styles.mobileDrawerItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accueil
                </Link>
                <span
                  className={`${styles.mobileDrawerItem} ${styles.mobileDrawerItemActive}`}
                  aria-current="page"
                >
                  Mes fichiers
                </span>
                {isAuthenticated && (
                  <>
                    <button
                      type="button"
                      className={styles.mobileDrawerItem}
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setShowAddModal(true)
                      }}
                    >
                      Ajouter des fichiers
                    </button>
                    <button
                      type="button"
                      className={styles.mobileDrawerItem}
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/connection"
                    className={styles.mobileDrawerItem}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                )}
                <footer className={styles.mobileDrawerFooter}>
                  Copyright DataShare<sup>©</sup> 2025
                </footer>
              </nav>
            </>
          ) : (
            isAuthenticated && (
              <div className={styles.partagerHeaderBar}>
                <div className={styles.partagerHeaderBarInner}>
                  <div className={styles.partagerHeaderActions}>
                    <button
                      type="button"
                      className={styles.btnAdd}
                      onClick={() => setShowAddModal(true)}
                      aria-haspopup="dialog"
                      aria-expanded={showAddModal}
                      aria-controls="add-file-modal"
                    >
                      Ajouter des fichiers
                    </button>
                    <button type="button" className={styles.btnLogout} onClick={handleLogout}>
                      <svg
                        className={styles.btnLogoutIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path
                          d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6"
                          stroke="#E27F29"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          <main className={styles.main}>{mainContent}</main>

          {isMobileView && mobileFilesModalOpen && (
            <>
              <div className={styles.mobileFilesModalOverlay} aria-hidden />
              <dialog
                open
                className={styles.mobileFilesModal}
                aria-modal="true"
                aria-labelledby="mobile-files-modal-title"
                onCancel={closeMobileFilesModal}
              >
                <header className={styles.mobileFilesModalHeader}>
                  <button
                    type="button"
                    className={styles.mobileFilesModalClose}
                    onClick={closeMobileFilesModal}
                    aria-label="Fermer"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <h2 id="mobile-files-modal-title" className={styles.mobileFilesModalTitle}>
                    DataShare
                  </h2>
                </header>
                <div className={styles.mobileFilesModalNav}>
                  <span className={styles.mobileFilesModalNavActive}>Mes fichiers</span>
                </div>
                <footer className={styles.mobileFilesModalFooter}>Copyright DataShare® 2025</footer>
              </dialog>
            </>
          )}
        </div>
      </div>

      {showAddModal && <AddFilesModal id="add-file-modal" onClose={() => setShowAddModal(false)} />}
      {downloadFileWithPassword && (
        <DownloadFileModalWithPassword
          file={downloadFileWithPassword}
          onClose={() => setDownloadFileWithPassword(null)}
        />
      )}
      {fileToDelete && (
        <DeleteConfirmModal
          file={fileToDelete}
          onConfirm={() => deleteMutation.mutate(fileToDelete.id)}
          onCancel={() => setFileToDelete(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
      {fileForShareLink && (
        <ShareLinkModal
          file={fileForShareLink}
          onClose={async () => {
            setFileForShareLink(null)
            await queryClient.refetchQueries({ queryKey: filesQueryKey })
          }}
        />
      )}
    </div>
  )
}
