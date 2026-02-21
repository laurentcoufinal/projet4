import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { filesQueryKey } from '@/hooks/useFiles'
import type { FileItem } from '@/types'
import styles from './FileRow.module.css'

interface FileRowProps {
  file: FileItem
  isOwner: boolean
  onShare: () => void
}

function formatSize(bytes?: number) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function FileRow({ file, isOwner, onShare }: FileRowProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => filesApi.delete(file.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filesQueryKey })
    },
  })

  const handleDownload = async () => {
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
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch {
      // ignore
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Supprimer « ${file.name} » ?`)) {
      deleteMutation.mutate()
    }
  }

  const hasSharedWith = (file.shared_with?.length ?? 0) > 0
  const hasShareLinks = (file.share_links?.length ?? 0) > 0
  const isShared = hasSharedWith || hasShareLinks
  const badgeTitle = hasShareLinks
    ? `${file.share_links?.length ?? 0} lien(s) actif(s)`
    : hasSharedWith
      ? 'Partagé avec des utilisateurs'
      : 'Partagé'
  const badgeRef = useRef<HTMLSpanElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleBadgeMouseEnter = () => {
    const el = badgeRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
    }
    setShowTooltip(true)
  }
  const handleBadgeMouseLeave = () => setShowTooltip(false)

  const tooltipEl =
    showTooltip &&
    isOwner &&
    isShared &&
    createPortal(
      <div
        className={styles.tooltip}
        role="tooltip"
        style={{ left: tooltipPos.x, top: tooltipPos.y }}
      >
        {badgeTitle}
      </div>,
      document.body
    )

  return (
    <li className={styles.row}>
      {tooltipEl}
      <span className={styles.name}>
        <span title={file.name}>{file.name}</span>
        {!isOwner && <span className={styles.badge}> partagé</span>}
        {isOwner && isShared && (
          <span
            ref={badgeRef}
            className={styles.badgeShared}
            onMouseEnter={handleBadgeMouseEnter}
            onMouseLeave={handleBadgeMouseLeave}
            aria-label={badgeTitle}
          >
            • Partagé
          </span>
        )}
      </span>
      {file.size != null && <span className={styles.size}>{formatSize(file.size)}</span>}
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={handleDownload} title="Télécharger">
          Télécharger
        </button>
        {isOwner && (
          <>
            <button type="button" className={styles.btn} onClick={onShare} title="Partager">
              Partager
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              title="Supprimer"
            >
              {deleteMutation.isPending ? '…' : 'Supprimer'}
            </button>
          </>
        )}
      </div>
    </li>
  )
}
