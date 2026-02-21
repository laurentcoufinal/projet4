import { Routes, Route } from 'react-router-dom'
import { FileSharePage } from '@/pages/FileSharePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FileSharePage />} />
    </Routes>
  )
}

export default App
