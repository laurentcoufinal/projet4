import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthStore, useIsAuthenticated } from './auth-store'
import type { User } from '@/types'

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}

describe('auth-store', () => {
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
