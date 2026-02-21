import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFiles } from './useFiles'
import * as filesApi from '@/api/files'
import type { ReactNode } from 'react'

vi.mock('@/api/files')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne une liste vide quand l’API renvoie data.data vide', async () => {
    vi.mocked(filesApi.filesApi.list).mockResolvedValueOnce({
      data: { data: [] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
    expect(filesApi.filesApi.list).toHaveBeenCalledTimes(1)
  })

  it('retourne la liste des fichiers quand l’API renvoie des données', async () => {
    const files = [
      { id: 1, name: 'doc.pdf' },
      { id: 2, name: 'image.png' },
    ]
    vi.mocked(filesApi.filesApi.list).mockResolvedValueOnce({
      data: { data: files },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as import('axios').InternalAxiosRequestConfig,
    })
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(files)
    expect(filesApi.filesApi.list).toHaveBeenCalledTimes(1)
  })

  it('retourne isLoading true puis false après résolution', async () => {
    vi.mocked(filesApi.filesApi.list).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { data: [] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as import('axios').InternalAxiosRequestConfig,
              }),
            50
          )
        )
    )
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('retourne une erreur quand l’API échoue', async () => {
    vi.mocked(filesApi.filesApi.list).mockRejectedValueOnce(new Error('Network error'))
    const { result } = renderHook(() => useFiles(), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})
