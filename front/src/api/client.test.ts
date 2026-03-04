import { describe, it, expect } from 'vitest'
import { apiClient } from './client'

describe('apiClient', () => {
  it('expose une instance axios avec interceptors', () => {
    expect(apiClient).toBeDefined()
    expect(apiClient.interceptors.request).toBeDefined()
    expect(apiClient.interceptors.response).toBeDefined()
  })

  it('baseURL se termine par /v1', () => {
    expect(apiClient.defaults.baseURL).toMatch(/\/v1$/)
  })
})
