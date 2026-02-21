import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileList } from './FileList'
import type { FileItem } from '@/types'

const mockUseFiles = vi.fn()
const mockUseIsAuthenticated = vi.fn()

vi.mock('@/hooks/useFiles', () => ({
  useFiles: () => mockUseFiles(),
}))

vi.mock('@/features/auth/auth-store', () => ({
  useIsAuthenticated: () => mockUseIsAuthenticated(),
}))

vi.mock('./FileRow', () => ({
  FileRow: ({ file }: { file: FileItem }) => <li data-testid="file-row">{file.name}</li>,
}))

vi.mock('@/features/files/ShareModal', () => ({
  ShareModal: () => null,
}))

describe('FileList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ne rend rien quand l’utilisateur n’est pas authentifié', () => {
    mockUseIsAuthenticated.mockReturnValue(false)
    mockUseFiles.mockReturnValue({ data: [], isLoading: false, error: null })
    const { container } = render(<FileList />)
    expect(container.firstChild).toBeNull()
  })

  it('affiche "Chargement…" quand useFiles est en chargement', () => {
    mockUseIsAuthenticated.mockReturnValue(true)
    mockUseFiles.mockReturnValue({ data: [], isLoading: true, error: null })
    render(<FileList />)
    expect(screen.getByText('Chargement…')).toBeInTheDocument()
  })

  it('affiche un message d’erreur quand useFiles a une erreur', () => {
    mockUseIsAuthenticated.mockReturnValue(true)
    mockUseFiles.mockReturnValue({ data: [], isLoading: false, error: new Error('fail') })
    render(<FileList />)
    expect(screen.getByText('Erreur lors du chargement des fichiers.')).toBeInTheDocument()
  })

  it('affiche "Aucun fichier pour le moment" et les stats 0 quand la liste est vide', () => {
    mockUseIsAuthenticated.mockReturnValue(true)
    mockUseFiles.mockReturnValue({ data: [], isLoading: false, error: null })
    render(<FileList />)
    expect(screen.getByTestId('files-stats')).toHaveTextContent('0 fichiers enregistrés')
    expect(screen.getByText('Aucun fichier pour le moment')).toBeInTheDocument()
  })

  it('affiche le nombre de fichiers et les noms quand la liste n’est pas vide', () => {
    const files: FileItem[] = [
      { id: 1, name: 'rapport.pdf', role: 'owner' },
      { id: 2, name: 'photo.jpg', role: 'owner' },
    ]
    mockUseIsAuthenticated.mockReturnValue(true)
    mockUseFiles.mockReturnValue({ data: files, isLoading: false, error: null })
    render(<FileList />)
    expect(screen.getByTestId('files-stats')).toHaveTextContent('2 fichiers enregistrés')
    const rows = screen.getAllByTestId('file-row')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('rapport.pdf')
    expect(rows[1]).toHaveTextContent('photo.jpg')
  })

  it('affiche le nombre de fichiers partagés (par vous) quand certains ont shared_with', () => {
    const files: FileItem[] = [
      { id: 1, name: 'a.pdf', role: 'owner', shared_with: [2] },
      { id: 2, name: 'b.pdf', role: 'owner', shared_with: [] },
    ]
    mockUseIsAuthenticated.mockReturnValue(true)
    mockUseFiles.mockReturnValue({ data: files, isLoading: false, error: null })
    render(<FileList />)
    expect(screen.getByTestId('files-stats')).toHaveTextContent('2 fichiers enregistrés')
    expect(screen.getByTestId('files-stats')).toHaveTextContent('1 partagé (par vous)')
  })
})
