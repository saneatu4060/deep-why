import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 型定義 (※将来的には src/types/api.ts 等への切り出しを推奨)
// ==========================================
interface StatsSummary {
    average_score: number;
    most_improved_metric: string;
    consecutive_days: number;
}

interface Session {
    session_id: string;
    theme: string;
    category: string;
    status: 'in_progress' | 'completed';
    created_at: string;
    updated_at: string;
    turn_count: number;
    average_score: number | null;
}

// ==========================================
// コンポーネント本体
// ==========================================
export default function Home() {
    const navigate = useNavigate();

    // 入力フォームの状態
    const [category, setCategory] = useState('技術・スキル');
    const [themeText, setThemeText] = useState('');

    // APIから取得するデータの状態
    const [stats, setStats] = useState<StatsSummary | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const placeholders: Record<string, string> = {
        '技術・スキル': '例：自分が得意な技術領域はどこか',
        'タスク・業務': '例：このタスクをどう分解するか',
        'コミュニケーション': '例：あの報連相はなぜうまくいかなかったか',
        'キャリア・強み': '例：自分はどんなエンジニアになりたいか',
        '価値観': '例：どんな仕事にやりがいを感じるか',
        '自由入力': '例：今日深めたいことを入力してください',
    };

    // ------------------------------
    // 初回マウント時にAPIを呼び出す
    // ------------------------------
    useEffect(() => {
        const fetchData = async () => {
            try {
                // FastAPI (localhost:8000) へリクエスト
                // ※ main.py で CORS (http://localhost:3000) が許可されているため通信可能です [1]
                const [statsRes, sessionsRes] = await Promise.all([
                    fetch('http://localhost:8000/stats/summary'),
                    fetch('http://localhost:8000/sessions')
                ]);

                if (statsRes.ok && sessionsRes.ok) {
                    const statsData = await statsRes.json();
                    const sessionsData = await sessionsRes.json();
                    setStats(statsData);
                    setSessions(sessionsData);
                } else {
                    console.error('データの取得に失敗しました');
                }
            } catch (error) {
                console.error('API通信エラー:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // ------------------------------
    // アクションハンドラー
    // ------------------------------
    const handleStartSession = () => {
        // TODO: 将来的にはここで POST /sessions を呼び出してIDを取得してから遷移します
        navigate('/session');
    };

    const handleResumeSession = (sessionId: string) => {
        navigate(`/session/${sessionId}`);
    };

    const handleViewResult = (sessionId: string) => {
        navigate(`/result/${sessionId}`);
    };

    const handleNavigateHistory = () => {
        navigate('/history');
    };

    // 日付文字列から "YYYY-MM-DD" を抽出するヘルパー関数
    const formatDate = (isoString: string) => isoString.split('T');

    return (
        <div className="space-y-6 w-full pb-2">

            {/* 成長ステータス */}
            <section className="bg-white rounded-[2rem] border-2 border-slate-200 p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-indigo-300 transition-colors relative overflow-hidden">
                <div className="text-center md:text-left z-10">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">エンジニアとしての成長</h2>
                    <p className="text-xs font-bold text-slate-500 mt-1">直近5セッションの分析結果</p>
                </div>
                <div className="flex gap-4 md:gap-8 bg-slate-50 p-3 px-6 rounded-full border-2 border-slate-100 z-10 min-h-[4rem] items-center">
                    {isLoading ? (
                        <p className="text-sm font-bold text-slate-400 px-4">読み込み中...</p>
                    ) : stats ? (
                        <>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest">平均スコア</p>
                                <p className="text-2xl font-black text-indigo-600 leading-none mt-1">{stats.average_score.toFixed(2)}</p>
                            </div>
                            <div className="w-0.5 h-8 bg-slate-200 rounded-full"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest">最も伸びた指標</p>
                                <p className="text-xl font-black text-slate-700 leading-none mt-1.5">{stats.most_improved_metric}</p>
                            </div>
                            <div className="w-0.5 h-8 bg-slate-200 rounded-full"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest">連続</p>
                                <p className="text-xl font-black text-slate-700 leading-none mt-1.5">{stats.consecutive_days}<span className="text-sm">日</span></p>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm font-bold text-slate-400 px-4">データ蓄積中...</p>
                    )}
                </div>
            </section>

            {/* セッション開始エリア */}
            <section className="bg-white rounded-[2rem] border-2 border-slate-200 p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full -z-0"></div>
                <div className="relative z-10">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-3 h-7 bg-indigo-600 rounded-full inline-block"></span>
                        モヤモヤを言語化する
                    </h2>
                    <div className="space-y-5">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3 xl:w-1/4">
                                <label className="block text-xs font-black text-slate-500 mb-2 ml-1 uppercase tracking-wider">Category</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold rounded-2xl focus:ring-0 focus:border-indigo-600 block p-3.5 outline-none transition-colors appearance-none cursor-pointer"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {Object.keys(placeholders).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:w-2/3 xl:w-3/4">
                                <label className="block text-xs font-black text-slate-500 mb-2 ml-1 uppercase tracking-wider">Theme / Issue</label>
                                <textarea
                                    rows={2}
                                    className="block p-3.5 w-full text-base font-bold text-slate-800 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:ring-0 focus:border-indigo-600 outline-none resize-none transition-colors placeholder-slate-400"
                                    placeholder={placeholders[category]}
                                    value={themeText}
                                    onChange={(e) => setThemeText(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                disabled={!themeText.trim()}
                                onClick={handleStartSession}
                                className="px-10 py-3.5 bg-indigo-600 text-white font-black tracking-widest rounded-full hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_rgba(49,46,129,1)] focus:outline-none disabled:bg-slate-200 disabled:text-slate-400 disabled:transform-none disabled:shadow-none transition-all text-sm"
                            >
                                セッションを開始
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 過去セッション一覧 */}
            <section>
                <div className="flex justify-between items-end mb-3 px-2 mt-2">
                    <h2 className="text-lg font-black text-slate-800">最近のセッション</h2>
                    <button
                        onClick={handleNavigateHistory}
                        className="text-xs font-black tracking-widest text-indigo-600 hover:text-indigo-800 uppercase transition-colors"
                    >
                        もっと見る &gt;
                    </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        // ローディング中のスケルトン表示
                        <div className="p-5 rounded-3xl border-2 border-slate-100 bg-slate-50 h-32 animate-pulse"></div>
                    ) : sessions.length > 0 ? (
                        // APIから取得したセッションを展開
                        sessions.map((session) => (
                            session.status === 'in_progress' ? (
                                // 途中カード（オレンジ系）
                                <div
                                    key={session.session_id}
                                    onClick={() => handleResumeSession(session.session_id)}
                                    className="group bg-white p-5 rounded-3xl border-2 border-amber-400 hover:bg-amber-50 hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-amber-400 text-amber-950 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">思考中</span>
                                            <span className="text-xs text-amber-600 font-bold">{formatDate(session.created_at)}</span>
                                        </div>
                                        <h3 className="font-bold text-sm md:text-base text-slate-800 line-clamp-2 leading-snug">{session.theme}</h3>
                                    </div>
                                    <div className="mt-4">
                                        <button className="w-full py-2.5 bg-amber-100 text-amber-800 text-sm font-black rounded-full group-hover:bg-amber-400 group-hover:text-amber-950 transition-colors">
                                            再開する
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // 完了カード（インディゴ系）
                                <div
                                    key={session.session_id}
                                    onClick={() => handleViewResult(session.session_id)}
                                    className="group bg-white p-5 rounded-3xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase">完了</span>
                                            <span className="text-xs text-slate-400 font-bold group-hover:text-indigo-500 transition-colors">{formatDate(session.created_at)}</span>
                                        </div>
                                        <h3 className="font-bold text-sm md:text-base text-slate-800 line-clamp-2 leading-snug">{session.theme}</h3>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-[11px] font-black text-indigo-600 bg-white border-2 border-indigo-100 px-3 py-1.5 rounded-full group-hover:border-indigo-300">
                                            SCORE: {session.average_score?.toFixed(2) || 'N/A'}
                                        </span>
                                        <button className="px-5 py-2.5 bg-slate-100 text-slate-600 text-sm font-black rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            詳細を見る
                                        </button>
                                    </div>
                                </div>
                            )
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-slate-500 font-bold">
                            セッション履歴がありません
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}