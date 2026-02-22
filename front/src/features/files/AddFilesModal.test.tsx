import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddFilesModal } from './AddFilesModal'
import * as filesApi from '@/api/files'
import type { ReactNode } from 'react'

vi.mock('@/api/files')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('AddFilesModal', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le titre Ajouter un fichier', () => {
    render(<AddFilesModal onClose={onClose} />, { wrapper: createWrapper() })
    expect(screen.getByRole('heading', { name: 'Ajouter un fichier' })).toBeInTheDocument()
  })

  it('affiche "Fichier trop volumineux (max 1 Go)." quand un fichier dépasse 1 Go', () => {
    render(<AddFilesModal onClose={onClose} />, { wrapper: createWrapper() })
    const input = document.getElementById('add-file-input') as HTMLInputElement
    expect(input).toBeInTheDocument()

    const oneGigabytePlusOne = 1024 * 1024 * 1024 + 1
    const bigFile = new File(['x'], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(bigFile, 'size', { value: oneGigabytePlusOne, configurable: true })

    fireEvent.change(input, { target: { files: [bigFile] } })

    expect(screen.getByText('Fichier trop volumineux (max 1 Go).')).toBeInTheDocument()
  })
})
