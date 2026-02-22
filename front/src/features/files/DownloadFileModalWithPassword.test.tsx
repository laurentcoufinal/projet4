import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DownloadFileModalWithPassword } from './DownloadFileModalWithPassword'
import * as filesApi from '@/api/files'
import type { FileItem } from '@/types'

vi.mock('@/api/files')

describe('DownloadFileModalWithPassword', () => {
  const file: FileItem = { id: 42, name: 'secret.pdf', size: 1024 }
  const fileWithPassword: FileItem = { ...file, requires_password: true }
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre et le nom du fichier', () => {
    render(<DownloadFileModalWithPassword file={file} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Télécharger un fichier' })).toBeInTheDocument()
    expect(screen.getByText('secret.pdf')).toBeInTheDocument()
  })

  it('sans mot de passe requis : affiche le bouton Télécharger (pas de champ mot de passe)', () => {
    render(<DownloadFileModalWithPassword file={file} onClose={onClose} />)
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/mot de passe/i)).not.toBeInTheDocument()
  })

  it('sans mot de passe requis : appelle download et onClose au clic sur Télécharger', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.download).mockResolvedValueOnce({
      data: new Blob(['x']),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<DownloadFileModalWithPassword file={file} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Télécharger' }))
    expect(filesApi.filesApi.download).toHaveBeenCalledWith(42)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('avec mot de passe requis : affiche le champ mot de passe et le bouton Télécharger', () => {
    render(<DownloadFileModalWithPassword file={fileWithPassword} onClose={onClose} />)
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/saisissez le mot de passe/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument()
  })

  it('avec mot de passe requis : appelle downloadWithPassword avec id et mot de passe au submit', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.downloadWithPassword).mockResolvedValueOnce({
      data: new Blob(['content']),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<DownloadFileModalWithPassword file={fileWithPassword} onClose={onClose} />)
    await user.type(screen.getByPlaceholderText(/saisissez le mot de passe/i), 'mypass')
    await user.click(screen.getByRole('button', { name: 'Télécharger' }))
    expect(filesApi.filesApi.downloadWithPassword).toHaveBeenCalledWith(42, 'mypass')
  })

  it('avec mot de passe requis : appelle onClose après un téléchargement réussi', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.downloadWithPassword).mockResolvedValueOnce({
      data: new Blob(['x']),
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<DownloadFileModalWithPassword file={fileWithPassword} onClose={onClose} />)
    await user.type(screen.getByPlaceholderText(/saisissez le mot de passe/i), 'pass')
    await user.click(screen.getByRole('button', { name: 'Télécharger' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('avec mot de passe requis : affiche une erreur quand l’API échoue', async () => {
    const user = userEvent.setup()
    vi.mocked(filesApi.filesApi.downloadWithPassword).mockRejectedValueOnce({
      response: { data: { message: 'Mot de passe incorrect.' } },
    })
    render(<DownloadFileModalWithPassword file={fileWithPassword} onClose={onClose} />)
    await user.type(screen.getByPlaceholderText(/saisissez le mot de passe/i), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Télécharger' }))
    expect(await screen.findByText('Mot de passe incorrect.')).toBeInTheDocument()
  })
})
