import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthStore, useIsAuthenticated } from './auth-store'
import type { User } from '@/types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}

describe('auth-store', () => {
  // #region agent log
  try {
    fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'auth-store.test.ts:describe', message: 'file started', data: { file: 'auth-store.test.ts', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {})
  } catch (_) {}
  afterAll(() => { try { fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' }, body: JSON.stringify({ sessionId: '2364c1', location: 'auth-store.test.ts:afterAll', message: 'file finished', data: { file: 'auth-store.test.ts', time: Date.now() }, timestamp: Date.now(), hypothesisId: 'H2', runId: 'run1' }) }).catch(() => {}) } catch (_) {} })
  // #endregion
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('état initial : token et user sont null', () => {
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setAuth enregistre token et user', () => {
    useAuthStore.getState().setAuth('abc-token', mockUser)
    expect(useAuthStore.getState().token).toBe('abc-token')
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('logout remet token et user à null', () => {
    useAuthStore.getState().setAuth('abc-token', mockUser)
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('useIsAuthenticated retourne false quand non connecté', () => {
    useAuthStore.getState().logout()
    const { result } = renderHook(() => useIsAuthenticated())
    expect(result.current).toBe(false)
  })

  it('useIsAuthenticated retourne true quand connecté', () => {
    useAuthStore.getState().setAuth('token', mockUser)
    const { result } = renderHook(() => useIsAuthenticated())
    expect(result.current).toBe(true)
  })
})
