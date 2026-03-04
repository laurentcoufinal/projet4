import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './HeroSection'

describe('HeroSection', () => {
  it('affiche le titre et le bouton partager', () => {
    render(<HeroSection />)
    expect(screen.getByRole('heading', { name: /Tu veux partager un fichier/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Partager un fichier/ })).toBeInTheDocument()
  })
})
