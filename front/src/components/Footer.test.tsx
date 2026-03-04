import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('affiche le copyright DataShare', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/DataShare/)
    expect(screen.getByText(/Copyright/)).toBeInTheDocument()
  })
})
