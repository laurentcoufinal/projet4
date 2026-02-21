/**
 * Extrait un message d’erreur à afficher à partir d’une erreur API (Laravel).
 * Utilise response.data.errors (liste de messages par champ) si présent,
 * sinon response.data.message, sinon le message par défaut.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const ax = err as { response?: { data?: unknown } }
  const data = ax.response?.data
  if (data && typeof data === 'object' && 'errors' in data) {
    const errors = (data as { errors: Record<string, unknown> }).errors
    if (errors && typeof errors === 'object') {
      const list: string[] = []
      for (const key of Object.keys(errors)) {
        const arr = errors[key]
        if (Array.isArray(arr)) list.push(...arr.filter((s): s is string => typeof s === 'string'))
        else if (typeof arr === 'string') list.push(arr)
      }
      if (list.length) return list.join(' • ')
    }
  }
  const message =
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
      ? (data as { message: string }).message
      : null
  return message ?? fallback
}
