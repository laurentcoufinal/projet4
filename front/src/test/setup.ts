import '@testing-library/jest-dom/vitest'

// #region agent log
try {
  fetch('http://127.0.0.1:7410/ingest/8a46d33e-9edb-46e2-8c27-e2e872cf5245', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '2364c1' },
    body: JSON.stringify({
      sessionId: '2364c1',
      location: 'setup.ts:entry',
      message: 'setup loaded',
      data: { time: Date.now() },
      timestamp: Date.now(),
      hypothesisId: 'H1',
      runId: 'run1',
    }),
  }).catch(() => {})
} catch (_) {}
// #endregion

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
