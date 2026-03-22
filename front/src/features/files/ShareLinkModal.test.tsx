import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
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
  vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined as never)
  return render(
    <QueryClientProvider client={queryClient}>
      <ShareLinkModal file={file} onClose={vi.fn()} {...props} />
    </QueryClientProvider>
  )
}

describe('ShareLinkModal', () => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal.test.tsx:describe', message: 'file started', data: { file: 'ShareLinkModal.test.tsx', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {})
  } catch (_) {}
  afterAll(() => { try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal.test.tsx:afterAll', message: 'file finished', data: { file: 'ShareLinkModal.test.tsx', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {}) } catch (_) {} })
  // #endregion
  beforeEach(() => {
    vi.mocked(filesApi.shareLink).mockResolvedValue({
      data: { url: 'https://app/shared/abc123', token: 'abc123', expires_at: '' },
    } as Awaited<ReturnType<typeof filesApi.shareLink>>)
  })

  it('affiche le titre Lien de partage et le nom du fichier', async () => {
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test1:start', message: 'test started', data: { test: 'titre et nom', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
    renderModal()
    await screen.findByDisplayValue(/https:\/\//, { timeout: 10000 })
    expect(screen.getByRole('heading', { name: /Lien de partage/ })).toBeInTheDocument()
    expect(screen.getByText('doc.pdf')).toBeInTheDocument()
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test1:end', message: 'test finished', data: { test: 'titre et nom', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
  })

  it('affiche le lien et le bouton Copier quand l’API a répondu', async () => {
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test2:start', message: 'test started', data: { test: 'lien et Copier', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
    renderModal()
    await screen.findByDisplayValue(/https:\/\//, { timeout: 10000 })
    expect(screen.getByRole('button', { name: /Copier le lien/ })).toBeInTheDocument()
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test2:end', message: 'test finished', data: { test: 'lien et Copier', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
  })

  it('appelle onClose au clic sur Fermer', async () => {
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test3:start', message: 'test started', data: { test: 'Fermer', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })
    await screen.findByDisplayValue(/https:\/\//, { timeout: 10000 })
    const fermerButtons = screen.getAllByRole('button', { name: /Fermer/ })
    await user.click(fermerButtons[0])
    expect(onClose).toHaveBeenCalled()
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test3:end', message: 'test finished', data: { test: 'Fermer', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
  })

  it('appelle onClose au clic sur la croix', async () => {
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test4:start', message: 'test started', data: { test: 'croix', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal({ onClose })
    await screen.findByDisplayValue(/https:\/\//, { timeout: 10000 })
    const fermerButtons = screen.getAllByRole('button', { name: /Fermer/ })
    await user.click(fermerButtons[0])
    expect(onClose).toHaveBeenCalled()
    // #region agent log
    try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'ShareLinkModal:test4:end', message: 'test finished', data: { test: 'croix', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H4', runId: 'run1' }) }).catch(() => {}) } catch (_) {}
    // #endregion
  })
})
