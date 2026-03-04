import { describe, it, expect } from 'vitest'
import {
  getFileExpiresAt,
  getLatestExpiresAt,
  getExpirationStatus,
  getExpirationLabel,
  getExpirationInfoMessage,
} from './mesFichiersUtils'
import type { FileItem } from '@/types'

describe('mesFichiersUtils', () => {
  describe('getFileExpiresAt', () => {
    it('retourne null si pas de expires_at', () => {
      expect(getFileExpiresAt({ id: 1, name: 'x', expires_at: null } as FileItem)).toBeNull()
      expect(getFileExpiresAt({ id: 1, name: 'x' } as FileItem)).toBeNull()
    })
    it('retourne la date si présente', () => {
      expect(
        getFileExpiresAt({ id: 1, name: 'x', expires_at: '2025-12-31T00:00:00Z' } as FileItem)
      ).toBe('2025-12-31T00:00:00Z')
    })
  })

  describe('getLatestExpiresAt', () => {
    it('retourne null si pas de share_links', () => {
      expect(getLatestExpiresAt({ id: 1, name: 'x', share_links: [] } as FileItem)).toBeNull()
      expect(getLatestExpiresAt({ id: 1, name: 'x' } as FileItem)).toBeNull()
    })
    it('retourne la plus grande date parmi les liens', () => {
      const file = {
        id: 1,
        name: 'x',
        share_links: [
          { id: 1, token: 'a', expires_at: '2025-06-01T00:00:00Z' },
          { id: 2, token: 'b', expires_at: '2025-12-31T00:00:00Z' },
        ],
      } as FileItem
      expect(getLatestExpiresAt(file)).toBe('2025-12-31T00:00:00Z')
    })
    it('ignore les liens sans expires_at', () => {
      const file = {
        id: 1,
        name: 'x',
        share_links: [
          { id: 1, token: 'a', expires_at: null },
          { id: 2, token: 'b', expires_at: '2025-06-01T00:00:00Z' },
        ],
      } as FileItem
      expect(getLatestExpiresAt(file)).toBe('2025-06-01T00:00:00Z')
    })
  })

  describe('getExpirationStatus', () => {
    it('retourne "none" si pas de date', () => {
      expect(getExpirationStatus({ id: 1, name: 'x' } as FileItem)).toBe('none')
    })
    it('retourne "expired" si date passée', () => {
      const past = new Date(Date.now() - 86400000).toISOString()
      expect(getExpirationStatus({ id: 1, name: 'x', expires_at: past } as FileItem)).toBe('expired')
    })
    it('retourne "active" si date future', () => {
      const future = new Date(Date.now() + 86400000).toISOString()
      expect(getExpirationStatus({ id: 1, name: 'x', expires_at: future } as FileItem)).toBe(
        'active'
      )
    })
  })

  describe('getExpirationLabel', () => {
    it('retourne "—" si pas de date', () => {
      expect(getExpirationLabel({ id: 1, name: 'x' } as FileItem)).toBe('—')
    })
    it('retourne "Expiré" si date passée', () => {
      const past = new Date(Date.now() - 86400000).toISOString()
      expect(getExpirationLabel({ id: 1, name: 'x', expires_at: past } as FileItem)).toBe('Expiré')
    })
    it('retourne "Expire dans N jours" pour date future', () => {
      const in5 = new Date()
      in5.setDate(in5.getDate() + 5)
      in5.setHours(12, 0, 0, 0)
      const file = { id: 1, name: 'x', expires_at: in5.toISOString() } as FileItem
      const label = getExpirationLabel(file)
      expect(label).toMatch(/^Expire dans \d+ jours$/)
      expect(parseInt(label.replace(/\D/g, ''), 10)).toBeGreaterThanOrEqual(4)
      expect(parseInt(label.replace(/\D/g, ''), 10)).toBeLessThanOrEqual(6)
    })
    it('retourne "Expire demain" pour demain', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const file = { id: 1, name: 'x', expires_at: tomorrow.toISOString() } as FileItem
      expect(getExpirationLabel(file)).toBe('Expire demain')
    })
  })

  describe('getExpirationInfoMessage', () => {
    it('retourne null si pas de lien ou date passée', () => {
      expect(getExpirationInfoMessage({ id: 1, name: 'x', share_links: [] } as FileItem)).toBeNull()
      const past = new Date(Date.now() - 86400000).toISOString()
      const file = {
        id: 1,
        name: 'x',
        share_links: [{ id: 1, token: 'a', expires_at: past }],
      } as FileItem
      expect(getExpirationInfoMessage(file)).toBeNull()
    })
    it('retourne le message pour date future', () => {
      const in3 = new Date()
      in3.setDate(in3.getDate() + 3)
      const file = {
        id: 1,
        name: 'x',
        share_links: [{ id: 1, token: 'a', expires_at: in3.toISOString() }],
      } as FileItem
      expect(getExpirationInfoMessage(file)).toBe('Ce fichier expirera dans 3 jours.')
    })
  })
})
