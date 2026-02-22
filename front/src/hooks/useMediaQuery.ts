import { useState, useEffect } from 'react'

/**
 * Breakpoint largeur mobile / iPhone : 480px.
 * En dessous, on affiche le layout mobile (menu 3 points, pas de boutons).
 */
export const MOBILE_MAX_WIDTH = 480

/**
 * Retourne true si la largeur de la fenêtre est <= MOBILE_MAX_WIDTH (écran type iPhone).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (globalThis.window === undefined) return false
    return globalThis.window.matchMedia(query).matches
  })

  useEffect(() => {
    const m = globalThis.window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    m.addEventListener('change', handler)
    setMatches(m.matches)
    return () => m.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * True si on est en largeur mobile (iPhone).
 */
export function useIsMobileView(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_MAX_WIDTH}px)`)
}
