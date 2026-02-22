import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { filesQueryKey } from '@/hooks/useFiles'
import type { FileItem } from '@/types'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  file: FileItem
  onClose: () => void
}

function formatExpiresAt(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return isoDate
  }
}

export function ShareModal({ file, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const shareMutation = useMutation({
    mutationFn: () => filesApi.shareLink(file.id, 7),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: filesQueryKey })
    },
  })

  const body = shareMutation.data?.data
  const existingLinks = file.share_links ?? []

  const apiBase =
    typeof import.meta.env.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL
      ? new URL(import.meta.env.VITE_API_BASE_URL).origin
      : typeof window !== 'undefined'
        ? window.location.origin
        : ''
  const displayLink =
    body?.url ?? (body?.token && apiBase ? `${apiBase}/api/v1/s/${body.token}` : null)
  const expiresAtLabel = body?.expires_at ? formatExpiresAt(body.expires_at) : null

  const handleCopy = async () => {
    if (displayLink) await copyToClipboard(displayLink)
  }

  const handleGenerate = () => {
    shareMutation.mutate(undefined)
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 id="share-title" className={styles.title}>
          Partager « {file.name} »
        </h2>
        {existingLinks.length > 0 && (
          <div className={styles.existingLinks}>
            <p className={styles.existingTitle}>
              {existingLinks.length} lien{existingLinks.length !== 1 ? 's' : ''} actif
              {existingLinks.length !== 1 ? 's' : ''}
            </p>
            <ul className={styles.existingList}>
              {existingLinks.map((link, i) => (
                <li key={i}>Valide jusqu'au {formatExpiresAt(link.expires_at)}</li>
              ))}
            </ul>
          </div>
        )}
        {shareMutation.isPending && <p className={styles.status}>Génération du lien…</p>}
        {shareMutation.isError && (
          <p className={styles.error}>Impossible de générer le lien de partage.</p>
        )}
        {displayLink && (
          <div className={styles.linkBlock}>
            {expiresAtLabel && <p className={styles.duration}>Valide jusqu'au {expiresAtLabel}</p>}
            <div className={styles.linkRow}>
              <input type="text" readOnly value={displayLink} className={styles.input} />
              <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                {copied ? 'Copié !' : 'Copier le lien'}
              </button>
            </div>
          </div>
        )}
        {!displayLink && !shareMutation.isPending && (
          <button type="button" className={styles.primary} onClick={handleGenerate}>
            Générer un lien de partage (API)
          </button>
        )}
        <button type="button" className={styles.secondary} onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}
