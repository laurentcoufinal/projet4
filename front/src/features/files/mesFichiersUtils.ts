import type { FileItem } from '@/types'

export type FileExpirationStatus = 'active' | 'expired' | 'none'

/**
 * Date d’expiration du fichier (durée de conservation), fournie par le serveur.
 * Distincte de l’expiration des liens (share_links[].expires_at).
 * Utilisée uniquement pour le statut affiché dans la liste (mis à jour à l’affichage via les données serveur).
 */
export function getFileExpiresAt(file: FileItem): string | null {
  const at = file.expires_at
  return at ?? null
}

/** Dernière date d’expiration parmi les share_links (expiration du lien). Utilisée pour le modal téléchargement. */
export function getLatestExpiresAt(file: FileItem): string | null {
  const links = file.share_links ?? []
  if (links.length === 0) return null
  const dates = links.map((l) => l.expires_at).filter(Boolean)
  if (dates.length === 0) return null
  return [...dates].sort((a, b) => a.localeCompare(b)).reverse()[0] ?? null
}

/** Statut d'expiration du fichier (durée du fichier), pas du lien. */
export function getExpirationStatus(file: FileItem): FileExpirationStatus {
  const at = getFileExpiresAt(file)
  if (!at) return 'none'
  const t = new Date(at).getTime()
  const now = Date.now()
  if (t < now) return 'expired'
  return 'active'
}

/** Texte affiché pour le statut : durée du fichier (expiration du fichier), pas du lien. */
export function getExpirationLabel(file: FileItem): string {
  const at = getFileExpiresAt(file)
  if (!at) return '—'
  const d = new Date(at)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dayEnd = new Date(now)
  dayEnd.setDate(dayEnd.getDate() + 1)
  const dayAfter = new Date(now)
  dayAfter.setDate(dayAfter.getDate() + 2)
  if (d.getTime() < now.getTime()) return 'Expiré'
  if (d.getTime() < dayEnd.getTime()) return "Expire aujourd'hui"
  if (d.getTime() < dayAfter.getTime()) return 'Expire demain'
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  return diffDays === 1 ? 'Expire dans 1 jour' : `Expire dans ${diffDays} jours`
}

/** Message pour la barre d’info du modal téléchargement (ex. "Ce fichier expirera dans 3 jours."). */
export function getExpirationInfoMessage(file: FileItem): string | null {
  const at = getLatestExpiresAt(file)
  if (!at) return null
  const d = new Date(at)
  const now = Date.now()
  if (d.getTime() < now) return null
  const diffDays = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return "Ce fichier expirera aujourd'hui."
  if (diffDays === 1) return 'Ce fichier expirera demain.'
  return `Ce fichier expirera dans ${diffDays} jours.`
}
