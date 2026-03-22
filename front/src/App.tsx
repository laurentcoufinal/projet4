import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { FileSharePage } from '@/pages/FileSharePage'
import { PartagerPage } from '@/pages/PartagerPage'
import { SharedFilePage } from '@/pages/SharedFilePage'
import { ConnectionPage } from '@/pages/ConnectionPage'
import { InscriptionPage } from '@/pages/InscriptionPage'

function RouteDebugLogger() {
  const location = useLocation()
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7248/ingest/cb806554-8ec7-4c00-9fa8-3db4a83cc406', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'a4ccaf',
      },
      body: JSON.stringify({
        sessionId: 'a4ccaf',
        location: 'App.tsx:RouteDebugLogger',
        message: 'route changed',
        data: { pathname: location.pathname, search: location.search },
        timestamp: Date.now(),
        hypothesisId: 'H2',
      }),
    }).catch(() => {})
    // #endregion
  }, [location.pathname, location.search])
  return null
}

function App() {
  return (
    <>
      <RouteDebugLogger />
      <Routes>
      <Route path="/" element={<FileSharePage />} />
      <Route path="/partager" element={<PartagerPage />} />
      <Route path="/shared/:token" element={<SharedFilePage />} />
      <Route path="/connection" element={<ConnectionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
    </Routes>
    </>
  )
}

export default App
