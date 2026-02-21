import '@testing-library/jest-dom/vitest'

// localStorage pour Zustand persist en test
const storage: Record<string, string> = {}
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      for (const k of Object.keys(storage)) delete storage[k]
    },
    length: 0,
    key: () => null,
  },
  writable: true,
})
