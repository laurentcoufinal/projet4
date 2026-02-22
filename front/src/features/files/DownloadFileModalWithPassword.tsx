import { useState } from 'react'
import { filesApi } from '@/api/files'
import type { FileItem } from '@/types'
import { getExpirationInfoMessage } from './mesFichiersUtils'
import styles from './DownloadFileModalWithPassword.module.css'

function formatSize(bytes?: number): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1).replace('.', ',')} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

interface DownloadFileModalWithPasswordProps {
  readonly file: FileItem
  readonly onClose: () => void
}

export function DownloadFileModalWithPassword({
  file,
  onClose,
}: DownloadFileModalWithPasswordProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const infoMessage = getExpirationInfoMessage(file)

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 100)
    onClose()
  }

  const handleDownloadNoPassword = async () => {
    setError(null)
    setLoading(true)
    try {
      const { data } = await filesApi.download(file.id)
      if (!(data instanceof Blob)) {
        setError('Réponse invalide.')
        return
      }
      triggerDownload(data)
    } catch {
      setError('Erreur lors du téléchargement.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await filesApi.downloadWithPassword(file.id, password)
      if (!(data instanceof Blob)) {
        setError('Réponse invalide.')
        return
      }
      triggerDownload(data)
    } catch (err: unknown) {
      let msg: string | null = null
      const res =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: unknown } }).response
          : null
      const data = res?.data
      if (data instanceof Blob) {
        try {
          const text = await data.text()
          const json = JSON.parse(text) as { message?: string }
          msg = json.message ?? null
        } catch {
          msg = null
        }
      } else if (
        data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof (data as { message: unknown }).message === 'string'
      ) {
        msg = (data as { message: string }).message
      }
      setError(msg ?? 'Erreur lors du téléchargement.')
    } finally {
      setLoading(false)
    }
  }

  const requiresPassword = file.requires_password === true

  if (!requiresPassword) {
    return (
      <div
        className={styles.overlay}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-file-title"
      >
        <div className={styles.cardNoPassword} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
            ×
          </button>
          <div className={styles.headerRow}>
            <h2 id="download-file-title" className={styles.titleNoPassword}>
              Télécharger un fichier
            </h2>
          </div>
          <div className={styles.contentCol}>
            <div className={styles.fileRowNoPassword}>
              <div className={styles.fileInner}>
                <span className={styles.fileIcon24} aria-hidden>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 8V4H5V20H19V8H15ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 9.5C11 10.3284 10.3284 11 9.5 11C8.67157 11 8 10.3284 8 9.5C8 8.67157 8.67157 8 9.5 8C10.3284 8 11 8.67157 11 9.5ZM17.5 17L13.5 10L8 17H17.5Z"
                      fill="black"
                    />
                  </svg>
                </span>
                <div className={styles.fileMeta}>
                  <span className={styles.fileNameNoPw} title={file.name}>
                    {file.name}
                  </span>
                  <span className={styles.fileSizeNoPw}>{formatSize(file.size) || '—'}</span>
                </div>
              </div>
            </div>
            {infoMessage && (
              <div className={styles.alertOrange} data-type="Alert">
                <span className={styles.alertIcon} aria-hidden>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.99953 5.99989V8.66656M7.99953 11.3332H8.00619M6.85953 2.57323L1.21286 11.9999C1.09644 12.2015 1.03484 12.4301 1.03418 12.6629C1.03353 12.8957 1.09385 13.1246 1.20914 13.3269C1.32443 13.5292 1.49068 13.6977 1.69133 13.8158C1.89199 13.9339 2.12006 13.9973 2.35286 13.9999H13.6462C13.879 13.9973 14.1071 13.9339 14.3077 13.8158C14.5084 13.6977 14.6746 13.5292 14.7899 13.3269C14.9052 13.1246 14.9655 12.8957 14.9649 12.6629C14.9642 12.4301 14.9026 12.2015 14.7862 11.9999L9.13953 2.57323C9.02068 2.3773 8.85334 2.21531 8.65366 2.10288C8.45397 1.99046 8.22868 1.9314 7.99953 1.9314C7.77037 1.9314 7.54508 1.99046 7.3454 2.10288C7.14571 2.21531 6.97837 2.3773 6.85953 2.57323Z"
                      stroke="#AA642B"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className={styles.alertText}>{infoMessage}</span>
              </div>
            )}
          </div>
          <div className={styles.actionsCol}>
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="button"
              className={`${styles.btnDownload} ${styles.btnDownloadOrange}`}
              onClick={handleDownloadNoPassword}
              disabled={loading}
            >
              <span className={styles.btnIcon} aria-hidden>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_dl_nopw)">
                    <path
                      d="M5.33378 11.3333L8.00044 14M8.00044 14L10.6671 11.3333M8.00044 14V7.99996M13.9204 12.06C14.5 11.6524 14.9347 11.0707 15.1613 10.3994C15.3879 9.72805 15.3947 9.00197 15.1807 8.32651C14.9667 7.65104 14.543 7.06135 13.9712 6.643C13.3993 6.22464 12.709 5.9994 12.0004 5.99996H11.1604C10.9599 5.21854 10.5848 4.49279 10.0632 3.87734C9.54161 3.2619 8.88721 2.7728 8.14925 2.44686C7.41129 2.12092 6.60901 1.96664 5.80279 1.99563C4.99658 2.02463 4.20745 2.23614 3.49481 2.61424C2.78217 2.99234 2.16459 3.52719 1.68857 4.17851C1.21254 4.82983 0.890478 5.58065 0.746618 6.37445C0.602757 7.16826 0.64085 7.98435 0.85803 8.7613C1.07521 9.53825 1.46582 10.2558 2.00044 10.86"
                      stroke="#BA681F"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_dl_nopw">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <span className={styles.btnLabel}>{loading ? 'Téléchargement…' : 'Télécharger'}</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-file-password-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <h2 id="download-file-password-title" className={styles.title}>
          Télécharger un fichier
        </h2>

        <div className={styles.fileRow}>
          <span className={styles.fileIcon} aria-hidden>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <div className={styles.fileInfo}>
            <span className={styles.fileName} title={file.name}>
              {file.name}
            </span>
            <span className={styles.fileSize}>{formatSize(file.size) || '—'}</span>
          </div>
        </div>

        {infoMessage && (
          <div className={styles.infoBar}>
            <span className={styles.infoIcon} aria-hidden>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <p className={styles.infoText}>{infoMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="download-password" className={styles.label}>
            Mot de passe
          </label>
          <input
            id="download-password"
            type="password"
            className={styles.input}
            placeholder="Saisissez le mot de passe..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            className={
              password.trim()
                ? `${styles.btnDownload} ${styles.btnDownloadActive}`
                : styles.btnDownload
            }
            disabled={loading}
          >
            <span className={styles.btnIcon} aria-hidden>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_dl_157)">
                  <path
                    d="M5.33378 11.3333L8.00044 14M8.00044 14L10.6671 11.3333M8.00044 14V7.99996M13.9204 12.06C14.5 11.6524 14.9347 11.0707 15.1613 10.3994C15.3879 9.72805 15.3947 9.00197 15.1807 8.32651C14.9667 7.65104 14.543 7.06135 13.9712 6.643C13.3993 6.22464 12.709 5.9994 12.0004 5.99996H11.1604C10.9599 5.21854 10.5848 4.49279 10.0632 3.87734C9.54161 3.2619 8.88721 2.7728 8.14925 2.44686C7.41129 2.12092 6.60901 1.96664 5.80279 1.99563C4.99658 2.02463 4.20745 2.23614 3.49481 2.61424C2.78217 2.99234 2.16459 3.52719 1.68857 4.17851C1.21254 4.82983 0.890478 5.58065 0.746618 6.37445C0.602757 7.16826 0.64085 7.98435 0.85803 8.7613C1.07521 9.53825 1.46582 10.2558 2.00044 10.86"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_dl_157">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span className={styles.btnLabel}>{loading ? 'Téléchargement…' : 'Télécharger'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
