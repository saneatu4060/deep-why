import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { StatCard } from '../components/StatCard';
import { SessionCard } from '../components/SessionCard';
import { THEME_CATEGORIES } from '../constants/themes';
import { getSessions, createSession } from '../api/sessions';
import { getStatsSummary } from '../api/stats';
import type { SessionResponse, StatsSummaryResponse } from '../types';

export const Home = () => {
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState(THEME_CATEGORIES.label);
    const [themeText, setThemeText] = useState('');

    const [stats, setStats] = useState<StatsSummaryResponse | null>(null);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, sessionsData] = await Promise.all([
                    getStatsSummary(),
                    getSessions(),
                ]);
                setStats(statsData);

                const sortedSessions = sessionsData.sort((a, b) => {
                    if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
                    if (a.status !== 'in_progress' && b.status === 'in_progress') return 1;
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
                });

                setSessions(sortedSessions.slice(0, 3));
            } catch (error) {
                console.error('データの取得に失敗しました', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentPlaceholder = THEME_CATEGORIES.find((c) => c.label === selectedCategory)?.placeholder || '';

    const handleStartSession = async () => {
        if (!themeText.trim()) return;
        try {
            await createSession({ theme: themeText, category: selectedCategory });
            navigate(`/session/sess_new_001`);
        } catch (error) {
            console.error('セッションの開始に失敗しました', error);
        }
    };

    const handleSessionAction = (sessionId: string, status: SessionResponse['status']) => {
        if (status === 'in_progress') {
            navigate(`/session/${sessionId}`);
        } else if (status === 'completed') {
            navigate(`/result/${sessionId}`);
        }
    };

    const hasEnoughData = sessions.length >= 2;

    if (isLoading) {
        return <div className="flex h-full items-center justify-center text-gray-500 py-20 font-serif">読み込み中...</div>;
    }

    return (
        <>
            {/* セッション開始エリア */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 font-serif">新しいテーマで思考を深める</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">カテゴリ</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-shadow"
                        >
                            {THEME_CATEGORIES.map((cat) => (
                                <option key={cat.label} value={cat.label}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">テーマ・悩み</label>
                        <textarea
                            value={themeText}
                            onChange={(e) => setThemeText(e.target.value)}
                            placeholder={currentPlaceholder}
                            className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-shadow"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleStartSession}
                            disabled={!themeText.trim()}
                            className="px-6 py-2 bg-gray-800 text-white font-bold font-serif rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            セッション開始
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 成長ステータスエリア */}
                <section>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 font-serif">成長ステータス</h2>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <StatCard
                            title="平均スコア"
                            value={hasEnoughData && stats ? stats.average_score.toFixed(2) : "データ蓄積中..."}
                        />
                        <StatCard
                            title="最も伸びた指標"
                            value={hasEnoughData && stats ? stats.most_improved_metric : "-"}
                        />
                    </div>
                    <StatCard
                        title="連続セッション日数"
                        value={hasEnoughData && stats ? `${stats.consecutive_days}日` : "-"}
                    />
                </section>

                {/* 過去セッション一覧エリア */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800 font-serif">最近のセッション</h2>
                        <Link to="/history" className="text-sm text-gray-600 hover:text-gray-900 hover:underline font-serif transition-colors">
                            もっと見る
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {sessions.length > 0 ? (
                            sessions.map((session) => (
                                <SessionCard
                                    key={session.session_id}
                                    session={session}
                                    onClickAction={handleSessionAction}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-xl border border-gray-200">
                                過去のセッションはありません。
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
};