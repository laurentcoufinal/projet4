import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DropZone } from './DropZone'
import * as filesApi from '@/api/files'
import type { ReactNode } from 'react'

vi.mock('@/api/files')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function triggerDrop(zone: HTMLElement, files: File[]) {
  fireEvent.drop(zone, { dataTransfer: { files } })
}

describe('DropZone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const MAX_SIZE_MB = 1024 // 1 Go, aligné avec le back et AddFilesModal

  it('affiche le label et le texte de la zone', () => {
    render(<DropZone maxSizeMb={MAX_SIZE_MB} />, { wrapper: createWrapper() })
    expect(screen.getByText('Glissez-déposez vos fichiers ici')).toBeInTheDocument()
    expect(screen.getByText('ou cliquez pour sélectionner des fichiers')).toBeInTheDocument()
  })

  it('contient un input file multiple', () => {
    render(<DropZone maxSizeMb={MAX_SIZE_MB} />, { wrapper: createWrapper() })
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput.type).toBe('file')
    expect(fileInput.getAttribute('accept')).toBe('*/*')
  })

  it('appelle l’API upload après drop de fichier', async () => {
    vi.mocked(filesApi.filesApi.upload).mockResolvedValueOnce({
      data: { data: { id: 1, name: 'test.pdf' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<DropZone maxSizeMb={MAX_SIZE_MB} />, { wrapper: createWrapper() })
    const zone = screen.getByTestId('drop-zone')
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    triggerDrop(zone, [file])
    await waitFor(() => expect(filesApi.filesApi.upload).toHaveBeenCalledTimes(1))
    const formData = vi.mocked(filesApi.filesApi.upload).mock.calls[0][0] as FormData
    expect(formData.get('file')).toBe(file)
    expect(formData.get('name')).toBe('test.pdf')
  })

  it('affiche "Envoi en cours…" pendant l’upload', async () => {
    let resolveUpload: (value: unknown) => void
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve
    })
    vi.mocked(filesApi.filesApi.upload).mockReturnValueOnce(
      uploadPromise as ReturnType<typeof filesApi.filesApi.upload>
    )
    render(<DropZone maxSizeMb={MAX_SIZE_MB} />, { wrapper: createWrapper() })
    const zone = screen.getByTestId('drop-zone')
    triggerDrop(zone, [new File(['x'], 'a.pdf', { type: 'application/pdf' })])
    await waitFor(() => {
      expect(screen.getByText('Envoi en cours…')).toBeInTheDocument()
    })
    resolveUpload!({
      data: { data: { id: 1, name: 'a.pdf' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
  })

  it('affiche "Erreur lors de l’envoi." en cas d’échec de l’API', async () => {
    vi.mocked(filesApi.filesApi.upload).mockRejectedValueOnce(new Error('Network error'))
    render(<DropZone maxSizeMb={MAX_SIZE_MB} />, { wrapper: createWrapper() })
    const zone = screen.getByTestId('drop-zone')
    triggerDrop(zone, [new File(['x'], 'a.pdf', { type: 'application/pdf' })])
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Erreur') && content.includes('envoi'))
      ).toBeInTheDocument()
    })
  })

  it('n’envoie pas les fichiers dépassant la taille max', () => {
    render(<DropZone maxSizeMb={1} />, { wrapper: createWrapper() })
    const zone = screen.getByTestId('drop-zone')
    const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.pdf', {
      type: 'application/pdf',
    })
    triggerDrop(zone, [bigFile])
    expect(filesApi.filesApi.upload).not.toHaveBeenCalled()
  })

  it('envoie uniquement les fichiers sous la limite quand mélangés', async () => {
    vi.mocked(filesApi.filesApi.upload).mockResolvedValue({
      data: { data: { id: 1, name: 'small.pdf' } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    render(<DropZone maxSizeMb={1} />, { wrapper: createWrapper() })
    const zone = screen.getByTestId('drop-zone')
    const small = new File(['x'], 'small.pdf', { type: 'application/pdf' })
    const big = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })
    triggerDrop(zone, [small, big])
    await waitFor(() => expect(filesApi.filesApi.upload).toHaveBeenCalledTimes(1))
    const formData = vi.mocked(filesApi.filesApi.upload).mock.calls[0][0] as FormData
    expect(formData.get('file')).toBe(small)
    expect(formData.get('name')).toBe('small.pdf')
  })
})
