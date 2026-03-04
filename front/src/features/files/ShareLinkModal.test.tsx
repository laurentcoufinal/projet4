import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { ShareLinkModal } from './ShareLinkModal'
import type { FileItem } from '@/types'
import { filesApi } from '@/api/files'

vi.mock('@/api/files', () => ({
  filesApi: {
    shareLink: vi.fn(),
  },
}))

const file: FileItem = {
  id: 1,
  name: 'doc.pdf',
  size: 100,
  mime_type: 'application/pdf',
  expires_at: null,
  share_links: [],
}

function renderModal(props: Partial<Parameters<typeof ShareLinkModal>[0]> = {}) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ShareLinkModal file={file} onClose={vi.fn()} {...props} />
    </QueryClientProvider>
  )
}

describe('ShareLinkModal', () => {
  beforeEach(() => {
    vi.mocked(filesApi.shareLink).mockResolvedValue({
      data: { url: 'https://app/shared/abc123', token: 'abc123', expires_at: '' },
    } as Awaited<ReturnType<typeof filesApi.shareLink>>)
  })

  it('affiche le titre Lien de partage et le nom du fichier', async () => {
    renderModal()
    expect(screen.getByRole('heading', { name: /Lien de partage/ })).toBeInTheDocument()
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
  })

  it('affiche le lien et le bouton Copier quand l’API a répondu', async () => {
    renderModal()
    await screen.findByDisplayValue(/https:\/\//)
    expect(screen.getByRole('button', { name: /Copier le lien/ })).toBeInTheDocument()
  })

  it('appelle onClose au clic sur Fermer', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })
    await screen.findByDisplayValue(/https:\/\//)
    const fermerButtons = screen.getAllByRole('button', { name: /Fermer/ })
    await user.click(fermerButtons[0])
    expect(onClose).toHaveBeenCalled()
  })

  it('appelle onClose au clic sur la croix', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })
    const fermerButtons = screen.getAllByRole('button', { name: /Fermer/ })
    await user.click(fermerButtons[0])
    expect(onClose).toHaveBeenCalled()
  })
})
