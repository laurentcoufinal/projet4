import { useRef, useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { filesApi } from '@/api/files'
import { filesQueryKey } from '@/hooks/useFiles'
import { getApiErrorMessage } from '@/features/auth/api-errors'
import styles from './AddFilesModal.module.css'

const MAX_FILE_SIZE_MB = 1024 // 1 Go
const MB = 1024 * 1024

const EXPIRATION_OPTIONS = [
  { value: 1, label: 'Une journée' },
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
] as const

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / MB).toFixed(1)} Mo`
}

interface AddFilesModalProps {
  readonly onClose: () => void
  /** Id du conteneur du modal (pour aria-controls du bouton déclencheur). */
  readonly id?: string
}

export function AddFilesModal({ onClose, id }: AddFilesModalProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState('')
  const [expirationDays, setExpirationDays] = useState(1)

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      passwordValue,
    }: {
      file: File
      passwordValue: string
      expirationDays: number
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      if (passwordValue.trim()) {
        formData.append('password', passwordValue)
      }
      const { data } = await filesApi.upload(formData)
      return data
    },
    onSuccess: async (data, variables) => {
      await queryClient.refetchQueries({ queryKey: filesQueryKey })
      const days = variables.expirationDays
      if (days > 0 && data?.id) {
        shareLinkMutation.mutate({ fileId: data.id, days })
      } else {
        onClose()
      }
    },
  })

  const shareLinkMutation = useMutation({
    mutationFn: ({ fileId, days }: { fileId: number; days: number }) =>
      filesApi.shareLink(fileId, days),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: filesQueryKey })
      onClose()
    },
    onError: async () => {
      await queryClient.refetchQueries({ queryKey: filesQueryKey })
      onClose()
    },
  })

  const [fileError, setFileError] = useState<string | null>(null)

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) {
      e.target.value = ''
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * MB) {
      setFileError('Fichier trop volumineux (max 1 Go).')
      e.target.value = ''
      return
    }
    setSelectedFile(file)
    e.target.value = ''
  }, [])

  const onChanger = useCallback(() => {
    setSelectedFile(null)
    fileInputRef.current?.click()
  }, [])

  const onSelectFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onTéléverser = useCallback(() => {
    if (!selectedFile) return
    uploadMutation.mutate({
      file: selectedFile,
      passwordValue: password,
      expirationDays,
    })
  }, [selectedFile, password, expirationDays, uploadMutation])

  const isPending = uploadMutation.isPending || shareLinkMutation.isPending
  const uploadError = uploadMutation.isError && getApiErrorMessage(uploadMutation.error, "Erreur lors de l'envoi.")
  const shareError = shareLinkMutation.isError && getApiErrorMessage(shareLinkMutation.error, "Erreur lors de la création du lien.")
  const error = uploadError || shareError

  return (
    <div id={id} className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-file-title">
      <div className={styles.modalWrap} onClick={(e) => e.stopPropagation()}>
        <div className={styles.card}>
      <input
        ref={fileInputRef}
        type="file"
        className={styles.inputHidden}
        onChange={onFileChange}
        accept="*/*"
        id="add-file-input"
      />
      <div className={styles.headerRow}>
        <h2 id="add-file-title" className={styles.title}>
          Ajouter un fichier
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fermer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className={styles.fileRow}>
        {selectedFile ? (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon} aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8V4H5V20H19V8H15ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8C10.3284 8 11 8.67157 11 9.5ZM17.5 17L13.5 10L8 17H17.5Z" fill="currentColor" />
              </svg>
            </span>
            <div className={styles.fileMeta}>
              <span className={styles.fileName} title={selectedFile.name}>
                {selectedFile.name}
              </span>
              <span className={styles.fileSize}>{formatSize(selectedFile.size)}</span>
            </div>
          </div>
        ) : (
          <label htmlFor="add-file-input" className={styles.fileInfo} aria-label="Sélectionner un fichier">
            <span className={styles.fileIcon} aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 8V4H5V20H19V8H15ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8C10.3284 8 11 8.67157 11 9.5ZM17.5 17L13.5 10L8 17H17.5Z" fill="currentColor" />
              </svg>
            </span>
            <div className={styles.fileMeta}>
              <span className={styles.fileName}>Sélectionner un fichier</span>
              <span className={styles.fileSize}>—</span>
            </div>
          </label>
        )}
        <button
          type="button"
          className={styles.btnChanger}
          onClick={selectedFile ? onChanger : onSelectFile}
        >
          {selectedFile ? 'Changer' : 'Sélectionner'}
        </button>
      </div>
      {fileError && <p className={styles.error} role="alert">{fileError}</p>}

      <div className={styles.formSection}>
        <div className={styles.field}>
          <label htmlFor="add-file-password" className={styles.fieldLabel}>
            Mot de passe
          </label>
          <input
            id="add-file-password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Optionnel"
            autoComplete="new-password"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="add-file-expiration" className={styles.fieldLabel}>
            Expiration
          </label>
          <div className={styles.selectWrap}>
            <select
              id="add-file-expiration"
              className={styles.select}
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
            >
              {EXPIRATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className={styles.selectChevron} aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.uploadRow}
        onClick={onTéléverser}
        disabled={isPending || !selectedFile}
      >
        <span className={styles.uploadIcon} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_upload)">
              <path d="M10.6666 10.6667L7.99997 8.00007M7.99997 8.00007L5.33331 10.6667M7.99997 8.00007V14.0001M13.5933 12.2601C14.2435 11.9056 14.7572 11.3447 15.0532 10.6658C15.3492 9.98698 15.4108 9.22889 15.2281 8.5112C15.0454 7.7935 14.629 7.15708 14.0444 6.70237C13.4599 6.24766 12.7405 6.00056 12 6.00007H11.16C10.9582 5.21956 10.5821 4.49496 10.0599 3.88073C9.5378 3.2665 8.8832 2.77864 8.14537 2.45381C7.40754 2.12898 6.60567 1.97564 5.80005 2.00533C4.99443 2.03501 4.20602 2.24694 3.49409 2.62518C2.78216 3.00342 2.16525 3.53814 1.68972 4.18913C1.2142 4.84011 0.892434 5.59043 0.748627 6.38367C0.60482 7.17691 0.64271 7.99242 0.859449 8.76891C1.07619 9.5454 1.46613 10.2626 1.99997 10.8667" stroke="#BA681F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_upload">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </span>
        <span>Téléverser</span>
      </button>

      {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
      </div>
    </div>
  )
}
