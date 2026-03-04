import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import { useAuthStore } from '@/features/auth/auth-store'

function renderHeader(
  props: Parameters<typeof Header>[0] = {},
  { user = null }: { user?: { id: number; name: string; email: string } | null } = {}
) {
  if (user) useAuthStore.getState().setAuth('token', user)
  return render(
    <MemoryRouter>
      <Header {...props} />
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('affiche le logo DataShare et le sous-titre en variant default', () => {
    renderHeader()
    expect(screen.getByText('DataShare')).toBeInTheDocument()
    expect(screen.getByText(/Partagez vos fichiers/)).toBeInTheDocument()
  })

  it('affiche le lien Se connecter quand non authentifié', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /Se connecter/ })).toHaveAttribute(
      'href',
      '/connection'
    )
  })

  it('affiche Déconnexion quand authentifié (variant default)', () => {
    renderHeader({}, { user: { id: 1, name: 'Alice', email: 'a@b.c' } })
    expect(screen.getByRole('button', { name: /Déconnexion/ })).toBeInTheDocument()
  })

  it('variant hero : pas de sous-titre, pas de nav Upload/Mes fichiers', () => {
    renderHeader({ variant: 'hero' })
    expect(screen.getByText('DataShare')).toBeInTheDocument()
    expect(screen.queryByText(/Partagez vos fichiers/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Se connecter/ })).toBeInTheDocument()
  })

  it('variant partager : bouton Ajouter des fichiers si onAddFilesClick fourni', () => {
    const onAdd = vi.fn()
    renderHeader({ variant: 'partager', onAddFilesClick: onAdd }, { user: { id: 1, name: 'U', email: 'u@u.u' } })
    const btn = screen.getByRole('button', { name: /Ajouter des fichiers/ })
    expect(btn).toBeInTheDocument()
    btn.click()
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('variant partager non connecté : lien Se connecter', () => {
    renderHeader({ variant: 'partager' })
    expect(screen.getByRole('link', { name: /Se connecter/ })).toBeInTheDocument()
  })
})
