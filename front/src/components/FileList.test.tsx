import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
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
  // #region agent log
  try {
    fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'FileList.test.tsx:describe', message: 'file started', data: { file: 'FileList.test.tsx', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {})
  } catch (_) {}
  afterAll(() => { try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'FileList.test.tsx:afterAll', message: 'file finished', data: { file: 'FileList.test.tsx', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {}) } catch (_) {} })
  // #endregion
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
