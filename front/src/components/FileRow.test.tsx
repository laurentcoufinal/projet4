import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FileRow } from './FileRow'
import type { AxiosResponse } from 'axios'
import * as filesApi from '@/api/files'
import type { FileItem } from '@/types'
import type { ReactNode } from 'react'

vi.mock('@/api/files')

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('FileRow', () => {
  const file: FileItem = { id: 1, name: 'rapport.pdf' }
  const onShare = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
  })

  it('affiche le nom du fichier et les boutons Télécharger, Partager, Supprimer quand isOwner', () => {
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    expect(screen.getByText('rapport.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Partager' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeInTheDocument()
  })

  it('affiche seulement Télécharger et le badge "partagé" quand non propriétaire', () => {
    render(<FileRow file={file} isOwner={false} onShare={onShare} />, { wrapper: createWrapper() })
    expect(screen.getByText(/rapport\.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/partagé/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Partager' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Supprimer' })).not.toBeInTheDocument()
  })

  it('affiche la taille formatée quand file.size est défini', () => {
    render(<FileRow file={{ ...file, size: 2048 }} isOwner onShare={onShare} />, {
      wrapper: createWrapper(),
    })
    expect(screen.getByText('2.0 Ko')).toBeInTheDocument()
  })

  it('appelle onShare au clic sur Partager', async () => {
    const user = userEvent.setup()
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Partager' }))
    expect(onShare).toHaveBeenCalledTimes(1)
  })

  it('appelle filesApi.download au clic sur Télécharger', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.download).mockResolvedValueOnce({
      data: new Blob(['content']),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Télécharger' }))
    expect(filesApi.filesApi.download).toHaveBeenCalledWith(1)
  })

  it('n’appelle pas filesApi.delete si l’utilisateur annule la confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockReturnValue(false)
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(window.confirm).toHaveBeenCalledWith('Supprimer « rapport.pdf » ?')
    expect(filesApi.filesApi.delete).not.toHaveBeenCalled()
  })

  it('appelle filesApi.delete si l’utilisateur confirme la suppression', async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockReturnValue(true)
    vi.mocked(filesApi.filesApi.delete).mockResolvedValueOnce({
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(filesApi.filesApi.delete).toHaveBeenCalledWith(1)
  })

  it('désactive le bouton Supprimer et affiche "…" pendant la suppression', async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockReturnValue(true)
    let resolveDelete: (value: AxiosResponse<unknown>) => void
    vi.mocked(filesApi.filesApi.delete).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDelete = resolve
      }) as ReturnType<typeof filesApi.filesApi.delete>
    )
    render(<FileRow file={file} isOwner onShare={onShare} />, { wrapper: createWrapper() })
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(screen.getByRole('button', { name: '…' })).toBeDisabled()
    resolveDelete!({
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
  })
})
