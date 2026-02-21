import { useFiles } from '@/hooks/useFiles'
import { useIsAuthenticated } from '@/features/auth/auth-store'
import { FileRow } from './FileRow'
import { ShareModal } from '@/features/files/ShareModal'
import { IconList } from './Icons'
import { useState, useMemo } from 'react'
import type { FileItem } from '@/types'
import styles from './FileList.module.css'

const ALL_TAGS_VALUE = '__all__'

function isOwner(file: FileItem): boolean {
  return (file.role ?? 'owner') === 'owner'
}

function getUniqueTags(files: FileItem[]): string[] {
  const tags = files.flatMap((f) => f.tags ?? [])
  return [...new Set(tags)].sort((a, b) => a.localeCompare(b))
}

export function FileList() {
  const { data: files = [], isLoading, error } = useFiles()
  const isAuthenticated = useIsAuthenticated()
  const [shareFile, setShareFile] = useState<FileItem | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | typeof ALL_TAGS_VALUE>(ALL_TAGS_VALUE)

  const { myFiles, sharedWithMe } = useMemo(() => {
    const mine = files.filter((f) => isOwner(f))
    const shared = files.filter((f) => !isOwner(f))
    return { myFiles: mine, sharedWithMe: shared }
  }, [files])

  const uniqueTags = useMemo(() => getUniqueTags(myFiles), [myFiles])
  const filteredMyFiles = useMemo(() => {
    if (selectedTag === ALL_TAGS_VALUE) return myFiles
    return myFiles.filter((f) => f.tags?.includes(selectedTag))
  }, [myFiles, selectedTag])

  if (!isAuthenticated) return null
  if (isLoading) return <div className={styles.card}>Chargement…</div>
  if (error) return <div className={styles.card}>Erreur lors du chargement des fichiers.</div>

  const sharedByMeCount = myFiles.filter((f) => f.shared_with && f.shared_with.length > 0).length

  return (
    <>
      <p className={`${styles.stats} glass-text`} data-testid="files-stats">
        {myFiles.length} fichier{myFiles.length !== 1 ? 's' : ''} enregistré
        {myFiles.length !== 1 ? 's' : ''}
        {sharedByMeCount > 0 && (
          <>
            {' '}
            • {sharedByMeCount} partagé{sharedByMeCount !== 1 ? 's' : ''} (par vous)
          </>
        )}
        {sharedWithMe.length > 0 && (
          <>
            {' '}
            • {sharedWithMe.length} reçu{sharedWithMe.length !== 1 ? 's' : ''} en partage
          </>
        )}
      </p>

      {/* Filtre par tag — toujours visible */}
      <div className={styles.filterRow} role="group" aria-label="Filtrer par tag">
        <span className={styles.filterLabel}>Filtrer par tag :</span>
        <div className={styles.filterButtons}>
          <button
            type="button"
            className={selectedTag === ALL_TAGS_VALUE ? styles.filterBtnActive : styles.filterBtn}
            onClick={() => setSelectedTag(ALL_TAGS_VALUE)}
          >
            Tous
          </button>
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={selectedTag === tag ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {uniqueTags.length === 0 && (
          <span className={styles.filterHint}>Ajoutez des tags lors de l’upload pour filtrer.</span>
        )}
      </div>
      <div className={styles.card}>
        {filteredMyFiles.length === 0 ? (
          <div className={styles.emptyWrap}>
            <IconList className={styles.emptyIcon} />
            <p className={styles.empty}>
              {selectedTag === ALL_TAGS_VALUE
                ? 'Aucun fichier pour le moment'
                : `Aucun fichier avec le tag « ${selectedTag} »`}
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredMyFiles.map((file) => (
              <FileRow key={file.id} file={file} isOwner onShare={() => setShareFile(file)} />
            ))}
          </ul>
        )}
      </div>

      {/* Fichiers partagés avec moi */}
      {sharedWithMe.length > 0 && (
        <>
          <h3 className={styles.subtitle}>Fichiers partagés avec moi</h3>
          <div className={styles.card}>
            <ul className={styles.list}>
              {sharedWithMe.map((file) => (
                <FileRow key={file.id} file={file} isOwner={false} onShare={() => {}} />
              ))}
            </ul>
          </div>
        </>
      )}

      {shareFile && <ShareModal file={shareFile} onClose={() => setShareFile(null)} />}
    </>
  )
}
