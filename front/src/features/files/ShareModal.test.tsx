import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShareModal } from './ShareModal'
import * as filesApi from '@/api/files'
import type { FileItem } from '@/types'
import type { ReactNode } from 'react'

vi.mock('@/api/files')

const writeTextMock = vi.fn().mockResolvedValue(undefined)

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('ShareModal', () => {
  const file: FileItem = { id: 42, name: 'doc.pdf' }
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    writeTextMock.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })
  })

  it('affiche le titre avec le nom du fichier et le bouton pour générer le lien (API)', () => {
    render(<ShareModal file={file} onClose={onClose} />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { name: /Partager « doc\.pdf »/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Générer un lien de partage (API)' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })

  it('appelle onClose au clic sur Fermer', async () => {
    const user = userEvent.setup()
    render(<ShareModal file={file} onClose={onClose} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Fermer' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('au clic sur Copier le lien, affiche "Copié !"', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.shareLink).mockResolvedValueOnce({
      data: { token: 'xyz' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<ShareModal file={file} onClose={onClose} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Générer un lien de partage (API)' }))
    await waitFor(() => {
      expect(screen.getByDisplayValue((v) => v.endsWith('/api/v1/s/xyz'))).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Copier le lien' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copié !' })).toBeInTheDocument()
    })
  })

  it('appelle l’API share et affiche le lien renvoyé au clic sur Générer un lien de partage (API)', async () => {
    const user = userEvent.setup()
    // Réponse axios : body = { data: { share_link } } => shareMutation.data.data.data.share_link
    vi.mocked(filesApi.filesApi.shareLink).mockResolvedValueOnce({
      data: { token: 'abc123' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<ShareModal file={file} onClose={onClose} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Générer un lien de partage (API)' }))
    expect(filesApi.filesApi.shareLink).toHaveBeenCalledWith(42, 7)
    await waitFor(() => {
      expect(
        screen.getByDisplayValue((v: string) => v.endsWith('/api/v1/s/abc123'))
      ).toBeInTheDocument()
    })
  })

  it('affiche un message d’erreur quand l’API share échoue', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.shareLink).mockRejectedValueOnce(new Error('Erreur réseau'))
    render(<ShareModal file={file} onClose={onClose} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Générer un lien de partage (API)' }))
    await vi.waitFor(() => {
      expect(screen.getByText('Impossible de générer le lien de partage.')).toBeInTheDocument()
    })
  })
})
