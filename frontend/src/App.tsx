import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Session } from './pages/Session';
import { Result } from './pages/Result';
import { History } from './pages/History';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      {/* 画面全体を包み、フレックスボックスでフッターを最下部に押しやるレイアウト */}
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">

        {/* 全画面共通のヘッダー */}
        <Navbar />

        {/* ページコンテンツが展開されるメイン領域。幅と余白をここで一括管理する */}
        <main className="flex-1 max-w-3xl mx-auto w-full py-8 px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<Session />} />
            <Route path="/result/:sessionId" element={<Result />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* 全画面共通のフッター */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}