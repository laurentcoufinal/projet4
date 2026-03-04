import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { FileItem } from '@/types'

const file: FileItem = {
  id: 1,
  name: 'document.pdf',
  size: 1024,
  mime_type: 'application/pdf',
  expires_at: null,
  share_links: [],
}

describe('DeleteConfirmModal', () => {
  it('affiche le titre et le nom du fichier', () => {
    render(
      <DeleteConfirmModal file={file} onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByRole('heading', { name: /Supprimer le fichier/ })).toBeInTheDocument()
    expect(screen.getByText(/document\.pdf/)).toBeInTheDocument()
  })

  it('appelle onCancel au clic sur Annuler ou Fermer', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <DeleteConfirmModal file={file} onConfirm={vi.fn()} onCancel={onCancel} />
    )
    await user.click(screen.getByRole('button', { name: /Annuler/ }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: /Fermer/ }))
    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('appelle onConfirm au clic sur Supprimer', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirmModal file={file} onConfirm={onConfirm} onCancel={vi.fn()} />
    )
    await user.click(screen.getByRole('button', { name: /^Supprimer$/ }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('affiche "Suppression…" et désactive les boutons quand isDeleting', () => {
    render(
      <DeleteConfirmModal
        file={file}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting
      />
    )
    expect(screen.getByRole('button', { name: /Suppression/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Annuler/ })).toBeDisabled()
  })
})
