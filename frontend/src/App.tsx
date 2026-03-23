import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Session from './pages/Session'
import Result from './pages/Result'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<Session />} />
            <Route path="/result/:sessionId" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}