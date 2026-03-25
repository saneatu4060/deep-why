import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';
import Result from './pages/Result';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      {/* 画面全体のベース */}
      <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 m-0 text-left">

        {/* スポーティなヘッダー（最前面固定） */}
        <header className="bg-white border-b-2 border-slate-200 shrink-0 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            {/* ロゴ押下時は S01 ホーム画面へ */}
            <Link to="/" className="text-2xl font-black text-indigo-700 italic tracking-wider">
              Deep Why
            </Link>
            <div className="flex space-x-2 sm:space-x-4">
              {/* ヘッダーボタン押下時の遷移 */}
              <Link to="/history" className="px-4 py-1.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition-all">履歴</Link>
              <Link to="/settings" className="px-4 py-1.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition-all">設定</Link>
            </div>
          </div>
        </header>

        {/* メインコンテンツ（ルーティング定義） */}
        <main className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-6 flex flex-col">
          <Routes>
            {/* S01: ホーム画面 */}
            <Route path="/" element={<Home />} />

            {/* S02: セッション画面 (新規セッション開始用) */}
            <Route path="/session" element={<Session />} />

            {/* S02: セッション画面 (途中セッションの「再開」ボタン用) */}
            <Route path="/session/:id" element={<Session />} />

            {/* S03: 結果画面 (完了セッションの「詳細」ボタン用) */}
            <Route path="/result/:id" element={<Result />} />

            {/* S04: 履歴画面 */}
            <Route path="/history" element={<History />} />

            {/* S05: 設定画面 */}
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* フッター */}
        <footer className="w-full bg-white border-t-2 border-slate-200 py-3 shrink-0 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center text-xs font-bold text-slate-400">
            &copy; 2026 Deep Why
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}