import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { filesQueryKey } from '@/hooks/useFiles'
import { useIsMobileView } from '@/hooks/useMediaQuery'
import { IconDotsVertical } from '@/components/Icons'
import type { FileItem } from '@/types'
import { getExpirationStatus, getExpirationLabel } from './mesFichiersUtils'
import styles from './MesFileRow.module.css'

interface MesFileRowProps {
  readonly file: FileItem
  /** Appelé au clic sur "Accéder" (ouvre le modal de téléchargement). */
  readonly onAccess?: (file: FileItem) => void
  /** Appelé au clic sur "Supprimer" (ouvre le modal de confirmation ; la suppression est gérée par le parent). */
  readonly onDeleteRequest?: (file: FileItem) => void
  /** Désactive le bouton Supprimer pendant la suppression (quand le parent gère la suppression). */
  readonly isDeleting?: boolean
  /** Appelé au clic sur "Lien" (ouvre le modal de création de lien ; si non fourni, création + copie directe). */
  readonly onLinkRequest?: (file: FileItem) => void
}

const MAX_DISPLAY_NAME_LENGTH = 20

function getDisplayName(name: string): string {
  if (name.length <= MAX_DISPLAY_NAME_LENGTH) return name
  return name.slice(0, MAX_DISPLAY_NAME_LENGTH) + '…'
}

function getIconClass(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'music'
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video'
  return 'document'
}

export function MesFileRow({ file, onAccess, onDeleteRequest, isDeleting = false, onLinkRequest }: MesFileRowProps) {
  const queryClient = useQueryClient()
  const isMobileView = useIsMobileView()
  const [rowMenuOpen, setRowMenuOpen] = useState(false)
  const rowMenuRef = useRef<HTMLDivElement>(null)
  const status = getExpirationStatus(file)
  const label = getExpirationLabel(file)
  const isExpired = status === 'expired'

  const deleteMutation = useMutation({
    mutationFn: () => filesApi.delete(file.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey })
    },
  })

  const shareLinkMutation = useMutation({
    mutationFn: async (days: number) => {
      const res = await filesApi.shareLink(file.id, days)
      return res.data
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey })
      const shareUrl = body?.url ?? ''
      if (shareUrl) navigator.clipboard.writeText(shareUrl).catch(() => {})
    },
  })

  const handleAccess = () => {
    if (onAccess) {
      onAccess(file)
    } else {
      doDownload()
    }
  }

  async function doDownload() {
    try {
      const { data } = await filesApi.download(file.id)
      if (!(data instanceof Blob)) return
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch {
      // ignore
    }
  }

  const handleDelete = () => {
    if (onDeleteRequest) {
      onDeleteRequest(file)
    } else if (globalThis.confirm(`Supprimer « ${file.name} » ?`)) {
      deleteMutation.mutate()
    }
  }

  const deleteDisabled = onDeleteRequest ? isDeleting : deleteMutation.isPending

  const handleCreateLink = () => {
    if (onLinkRequest) {
      onLinkRequest(file)
    } else {
      shareLinkMutation.mutate(7)
    }
  }

  const showLinkButton = !isExpired && !file.requires_password
  const iconType = getIconClass(file.name)

  useEffect(() => {
    if (!rowMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) {
        setRowMenuOpen(false)
      }
    }
    globalThis.document.addEventListener('click', handleClickOutside)
    return () => globalThis.document.removeEventListener('click', handleClickOutside)
  }, [rowMenuOpen])

  function renderRowActions() {
    if (isExpired) {
      return (
        <p className={styles.expiredMessage}>
          Ce fichier a expiré, il n'est plus stocké chez nous
        </p>
      )
    }
    if (isMobileView) {
      return (
        <div className={styles.rowMenuWrap} ref={rowMenuRef}>
          <button
            type="button"
            className={styles.rowMenuTrigger}
            onClick={() => setRowMenuOpen((o) => !o)}
            aria-label="Actions pour ce fichier"
            aria-expanded={rowMenuOpen}
            aria-haspopup="true"
          >
            <IconDotsVertical className={styles.rowMenuIcon} />
          </button>
          {rowMenuOpen && (
            <ul className={styles.rowMenuDropdown} aria-label="Actions">
              <li>
                <button
                  type="button"
                  className={styles.rowMenuItem}
                  onClick={() => { setRowMenuOpen(false); handleAccess(); }}
                >
                  Accéder
                </button>
              </li>
              {showLinkButton && (
                <li>
                  <button
                    type="button"
                    className={styles.rowMenuItem}
                    onClick={() => { setRowMenuOpen(false); handleCreateLink(); }}
                    disabled={!onLinkRequest && shareLinkMutation.isPending}
                  >
                    {!onLinkRequest && shareLinkMutation.isPending ? '…' : 'Lien'}
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  className={styles.rowMenuItem}
                  onClick={() => { setRowMenuOpen(false); handleDelete(); }}
                  disabled={deleteDisabled}
                >
                  Supprimer
                </button>
              </li>
            </ul>
          )}
        </div>
      )
    }
    return (
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.btnDelete}
          onClick={handleDelete}
          disabled={deleteDisabled}
          title="Supprimer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3.99992H3.33333M3.33333 3.99992H14M3.33333 3.99992L3.33333 13.3333C3.33333 13.6869 3.47381 14.026 3.72386 14.2761C3.97391 14.5261 4.31304 14.6666 4.66667 14.6666H11.3333C11.687 14.6666 12.0261 14.5261 12.2761 14.2761C12.5262 14.026 12.6667 13.6869 12.6667 13.3333V3.99992M5.33333 3.99992V2.66659C5.33333 2.31296 5.47381 1.97382 5.72386 1.72378C5.97391 1.47373 6.31304 1.33325 6.66667 1.33325H9.33333C9.68696 1.33325 10.0261 1.47373 10.2761 1.72378C10.5262 1.97382 10.6667 2.31296 10.6667 2.66659V3.99992M6.66667 7.33325V11.3333M9.33333 7.33325V11.3333" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Supprimer
        </button>
        {showLinkButton && (
          <button
            type="button"
            className={styles.btnLink}
            onClick={handleCreateLink}
            disabled={!onLinkRequest && shareLinkMutation.isPending}
            title={onLinkRequest ? 'Créer un lien de partage' : 'Créer un lien de partage (copié dans le presse-papier)'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6.5 8.5L9.5 5.5M9.5 5.5C10.5 4.5 12 4.5 13 5.5C14 6.5 14 8 13 9M9.5 5.5C8.5 6.5 8.5 8 9.5 9C10.5 10 12 10 13 9M6.5 7.5L3.5 10.5C2.5 11.5 2.5 13 3.5 14C4.5 15 6 15 7 14L10 11M6.5 7.5C7.5 6.5 9 6.5 10 7.5C11 8.5 11 10 10 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {!onLinkRequest && shareLinkMutation.isPending ? '…' : 'Lien'}
          </button>
        )}
        <button
          type="button"
          className={styles.btnAccess}
          onClick={handleAccess}
          title="Accéder au fichier"
        >
          Accéder
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.33325 7.99992H12.6666M12.6666 7.99992L7.99992 3.33325M12.6666 7.99992L7.99992 12.6666" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <li className={styles.row}>
      <span className={styles.icon} aria-hidden>
        {iconType === 'music' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8V10H13V14.5C13 15.8807 11.8807 17 10.5 17C9.11929 17 8 15.8807 8 14.5C8 13.1193 9.11929 12 10.5 12C10.6712 12 10.8384 12.0172 11 12.05V8H15V4H5V20H19V8H16ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z" fill="currentColor" />
          </svg>
        )}
        {iconType === 'video' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 4V8H19V20H5V4H15ZM3.9985 2C3.44749 2 3 2.44405 3 2.9918V21.0082C3 21.5447 3.44476 22 3.9934 22H20.0066C20.5551 22 21 21.5489 21 20.9925L20.9997 7L16 2H3.9985ZM15.0008 11.667L10.1219 8.41435C10.0562 8.37054 9.979 8.34717 9.9 8.34717C9.6791 8.34717 9.5 8.52625 9.5 8.74717V15.2524C9.5 15.3314 9.5234 15.4086 9.5672 15.4743C9.6897 15.6581 9.9381 15.7078 10.1219 15.5852L15.0008 12.3326C15.0447 12.3033 15.0824 12.2656 15.1117 12.2217C15.2343 12.0379 15.1846 11.7895 15.0008 11.667Z" fill="currentColor" />
          </svg>
        )}
        {iconType === 'document' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 8V4H5V20H19V8H15ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8C10.3284 8 11 8.67157 11 9.5ZM17.5 17L13.5 10L8 17H17.5Z" fill="currentColor" />
          </svg>
        )}
      </span>
      <div className={styles.nameBlock}>
        <span className={styles.name} title={file.name}>
          {getDisplayName(file.name)}
        </span>
        <span className={isExpired ? `${styles.status} ${styles.statusExpired}` : styles.status}>
          {label}
        </span>
      </div>
      {!isExpired && file.requires_password && (
        <span className={styles.lockIcon} title="Fichier protégé par mot de passe" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      )}
      {renderRowActions()}
    </li>
  )
}
