import { Routes, Route } from 'react-router-dom'
import { FileSharePage } from '@/pages/FileSharePage'
import { PartagerPage } from '@/pages/PartagerPage'
import { SharedFilePage } from '@/pages/SharedFilePage'
import { ConnectionPage } from '@/pages/ConnectionPage'
import { InscriptionPage } from '@/pages/InscriptionPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FileSharePage />} />
      <Route path="/partager" element={<PartagerPage />} />
      <Route path="/shared/:token" element={<SharedFilePage />} />
      <Route path="/connection" element={<ConnectionPage />} />
      <Route path="/inscription" element={<InscriptionPage />} />
    </Routes>
  )
}

export default App
