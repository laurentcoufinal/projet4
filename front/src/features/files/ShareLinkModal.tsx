import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { filesQueryKey } from '@/hooks/useFiles'
import type { FileItem } from '@/types'
import styles from './ShareLinkModal.module.css'

const DEFAULT_DAYS = 7

interface ShareLinkModalProps {
  readonly file: FileItem
  readonly onClose: () => void
  readonly expiresInDays?: number
}

export function ShareLinkModal({
  file,
  onClose,
  expiresInDays = DEFAULT_DAYS,
}: ShareLinkModalProps) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const shareLinkMutation = useMutation({
    mutationFn: async (days: number) => {
      const res = await filesApi.shareLink(file.id, days)
      return res.data
    },
    onSuccess: async (body) => {
      const url = body?.url ?? ''
      setShareUrl(url)
      await queryClient.refetchQueries({ queryKey: filesQueryKey })
    },
  })

  useEffect(() => {
    shareLinkMutation.mutate(expiresInDays)
  }, [file.id])

  const handleCreateLink = () => {
    shareLinkMutation.mutate(expiresInDays)
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const isLoading = shareLinkMutation.isPending
  const error = shareLinkMutation.isError

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-link-title"
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <h2 id="share-link-title" className={styles.title}>
          Lien de partage
        </h2>
        <p className={styles.fileName}>{file.name}</p>
        {isLoading && <p className={styles.status}>Création du lien…</p>}
        {error && (
          <p className={styles.error} role="alert">
            Erreur lors de la création du lien.
          </p>
        )}
        {shareUrl && (
          <>
            <div className={styles.urlRow}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className={styles.urlInput}
                aria-label="Lien de partage"
              />
            </div>
            <p className={styles.hint}>
              Ce lien permet de télécharger le fichier. Il est valide {expiresInDays} jour{expiresInDays > 1 ? 's' : ''}.
            </p>
          </>
        )}
        <div className={styles.actions}>
          {!shareUrl && !isLoading && (
            <button
              type="button"
              className={styles.btnCreate}
              onClick={handleCreateLink}
              disabled={isLoading}
            >
              Créer le lien
            </button>
          )}
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Fermer
          </button>
          {shareUrl && (
            <button type="button" className={styles.btnCopy} onClick={handleCopy}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M5.33333 5.33333H11.3333V11.3333H5.33333V5.33333ZM4 4V12.6667H12.6667V4H4ZM10.6667 2H2.66667C2.29848 2 2 2.29848 2 2.66667V10.6667H4V3.33333H12C12.3682 3.33333 12.6667 3.03486 12.6667 2.66667V2H10.6667Z" fill="currentColor" />
              </svg>
              {copied ? 'Copié !' : 'Copier le lien'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
