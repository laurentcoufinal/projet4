import { useQuery } from '@tanstack/react-query'
import { filesApi } from '@/api/files'

export const filesQueryKey = ['files'] as const

export function useFiles() {
  return useQuery({
    queryKey: filesQueryKey,
    queryFn: async () => {
      const { data } = await filesApi.list()
      return data.data ?? []
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}
