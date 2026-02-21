import { useCallback, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { getApiErrorMessage } from '@/features/auth/api-errors'
import styles from './DropZone.module.css'

const MB = 1024 * 1024

/** Types MIME dangereux refusés côté client (UX). La sécurité réelle doit être assurée par le backend. */
const BLOCKED_MIME_PREFIXES = [
  'application/x-msdownload', // .exe
  'application/x-executable',
  'application/javascript',
  'application/x-javascript',
  'text/javascript',
  'application/x-msi',
  'application/vnd.microsoft.portable-executable',
  'application/x-sh',
  'application/x-shellscript',
]

function isBlockedMime(type: string): boolean {
  const t = type.toLowerCase().trim()
  return BLOCKED_MIME_PREFIXES.some((prefix) => t === prefix || t.startsWith(prefix + ';'))
}

interface DropZoneProps {
  maxSizeMb: number
}

function parseTags(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function DropZone({ maxSizeMb }: DropZoneProps) {
  const [drag, setDrag] = useState(false)
  const [tagsInput, setTagsInput] = useState('')
  const queryClient = useQueryClient()
  const maxBytes = maxSizeMb * MB
  const zoneRef = useRef<HTMLDivElement>(null)

  const [rejectedMessage, setRejectedMessage] = useState<string | null>(null)
  const [allRejectedMessage, setAllRejectedMessage] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async ({
      files,
      tags,
    }: {
      files: File[]
      tags: string[]
      rejectedNames?: string[]
    }) => {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', file.name)
        tags.forEach((tag) => formData.append('tags[]', tag))
        await filesApi.upload(formData)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      if (variables.rejectedNames?.length) {
        setRejectedMessage(
          `${variables.rejectedNames.length} fichier(s) ignoré(s) (type non autorisé).`
        )
      } else {
        setRejectedMessage(null)
      }
    },
    onMutate: () => {
      setRejectedMessage(null)
      setAllRejectedMessage(null)
    },
  })

  const validateAndUpload = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return
      setAllRejectedMessage(null)
      const valid: File[] = []
      const rejectedByType: string[] = []
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        if (f.size > maxBytes) continue
        if (isBlockedMime(f.type || '')) {
          rejectedByType.push(f.name)
          continue
        }
        valid.push(f)
      }
      if (valid.length === 0) {
        if (rejectedByType.length > 0) {
          setAllRejectedMessage('Ces types de fichiers ne sont pas autorisés.')
        }
        return
      }
      uploadMutation.mutate({
        files: valid,
        tags: parseTags(tagsInput),
        rejectedNames: rejectedByType,
      })
    },
    [maxBytes, uploadMutation, tagsInput]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDrag(false)
      validateAndUpload(e.dataTransfer.files)
    },
    [validateAndUpload]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDrag(false)
  }, [])

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndUpload(e.target.files)
      e.target.value = ''
    },
    [validateAndUpload]
  )

  return (
    <div
      ref={zoneRef}
      data-testid="drop-zone"
      className={`${styles.zone} ${drag ? styles.zoneDrag : ''}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        type="file"
        multiple
        className={styles.input}
        onChange={onFileInputChange}
        accept="*/*"
        id="file-upload"
      />
      <div className={styles.tagsRow}>
        <label htmlFor="dropzone-tags" className={styles.tagsLabel}>
          Tags (optionnel, séparés par des virgules)
        </label>
        <input
          id="dropzone-tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="ex: work, archive"
          className={styles.tagsInput}
          aria-describedby="dropzone-tags-hint"
        />
        <span id="dropzone-tags-hint" className={styles.tagsHint}>
          Ces tags seront appliqués aux prochains fichiers envoyés.
        </span>
      </div>
      <label htmlFor="file-upload" className={styles.label}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            rx="2"
            stroke="#ffffff"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M12 6 v6 M12 6 l-3 3 M12 6 l3 3"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M7 16 h10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className={styles.text}>Glissez-déposez vos fichiers ici</span>
        <span className={styles.sub}>ou cliquez pour sélectionner des fichiers</span>
      </label>
      {uploadMutation.isPending && <p className={styles.status}>Envoi en cours…</p>}
      {uploadMutation.isError && (
        <p className={styles.error}>
          {getApiErrorMessage(uploadMutation.error, "Erreur lors de l'envoi.")}
        </p>
      )}
      {rejectedMessage && (
        <p className={styles.rejectedHint} role="status">
          {rejectedMessage}
        </p>
      )}
      {allRejectedMessage && (
        <p className={styles.error} role="alert">
          {allRejectedMessage}
        </p>
      )}
    </div>
  )
}
