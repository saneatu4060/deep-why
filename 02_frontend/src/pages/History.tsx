import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import { getSessions, deleteSession } from '../api/sessions';
import { getStatsSummary, getScoreHistory, getCategoryDistribution } from '../api/stats';
import type { SessionResponse, StatsSummaryResponse } from '../types';

// Chart.jsの登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export const History = () => {
    const navigate = useNavigate();

    // データ状態
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [summary, setSummary] = useState<StatsSummaryResponse | null>(null);
    const [scoreHistory, setScoreHistory] = useState<any[]>([]);
    const [categoryDist, setCategoryDist] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI制御状態
    const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
    const [graphTab, setGraphTab] = useState<'average' | 'concreteness' | 'causality' | 'definitiveness'>('average');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // データ取得
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sessionsRes, summaryRes, historyRes, distRes] = await Promise.all([
                getSessions(),
                getStatsSummary(),
                getScoreHistory(),
                getCategoryDistribution()
            ]);
            setSessions(sessionsRes);
            setSummary(summaryRes);
            setScoreHistory(historyRes);
            setCategoryDist(distRes);
        } catch (error) {
            console.error('データの取得に失敗しました', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 削除ハンドラ
    const handleDelete = async (sessionId: string) => {
        if (window.confirm('削除すると復元できません。本当に削除しますか？')) {
            try {
                await deleteSession(sessionId);
                // 削除後にデータを再取得
                fetchData();
            } catch (error) {
                console.error('削除に失敗しました', error);
                alert('削除に失敗しました。');
            }
        }
    };

    // フィルタリングとページネーションの計算
    const filteredSessions = sessions.filter(s => {
        if (filter === 'all') return true;
        return s.status === filter;
    });

    const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
    const currentSessions = filteredSessions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // フィルター切り替え時にページを1に戻す
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // 日付フォーマット関数
    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    // グラフ用データ（スコア推移）
    const getScoreChartData = () => {
        const labels = scoreHistory.map((_, i) => `#${i + 1}`);
        let data = [];
        let label = '';
        let color = '';

        switch (graphTab) {
            case 'average':
                data = scoreHistory.map(d => d.average_score);
                label = '平均スコア';
                color = '#1f2937';
                break;
            case 'concreteness':
                data = scoreHistory.map(d => d.concreteness);
                label = '具体性';
                color = '#4b5563';
                break;
            case 'causality':
                data = scoreHistory.map(d => d.causality);
                label = '因果性';
                color = '#6b7280';
                break;
            case 'definitiveness':
                data = scoreHistory.map(d => d.definitiveness);
                label = '定義度';
                color = '#9ca3af';
                break;
        }

        return {
            labels,
            datasets: [
                {
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.1,
                }
            ]
        };
    };

    // グラフ用データ（カテゴリ分布）
    const categoryChartData = {
        labels: categoryDist.map(d => d.category),
        datasets: [
            {
                label: 'セッション数',
                data: categoryDist.map(d => d.count),
                backgroundColor: '#4b5563',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } },
    };

    if (isLoading) {
        return <div className="flex justify-center py-20 font-serif text-gray-500">データを読み込んでいます...</div>;
    }

    return (
        <div className="flex flex-col gap-8 font-serif">
            <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2">履歴・分析</h1>

            {/* サマリーカード */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm flex flex-col sm:flex-row justify-around items-center gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-500">総セッション数</p>
                    <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
                <div>
                    <p className="text-sm text-gray-500">平均スコア (直近)</p>
                    <p className="text-2xl font-bold text-gray-800">{summary?.average_score?.toFixed(2) || '-'}</p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-200"></div>
                <div>
                    <p className="text-sm text-gray-500">最も伸びた指標</p>
                    <p className="text-2xl font-bold text-gray-800">{summary?.most_improved_metric || '-'}</p>
                </div>
            </div>

            {/* グラフエリア */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 長期スコア推移 */}
                <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">長期スコア推移</h2>
                        <select
                            value={graphTab}
                            onChange={(e) => setGraphTab(e.target.value as any)}
                            className="text-sm border-gray-300 rounded-md focus:ring-gray-400 focus:border-gray-400"
                        >
                            <option value="average">平均スコア</option>
                            <option value="concreteness">具体性</option>
                            <option value="causality">因果性</option>
                            <option value="definitiveness">定義度</option>
                        </select>
                    </div>
                    <div className="h-48 w-full">
                        <Line data={getScoreChartData()} options={chartOptions} />
                    </div>
                </div>

                {/* カテゴリ分布 */}
                <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">テーマカテゴリ分布</h2>
                    <div className="h-48 w-full">
                        <Bar data={categoryChartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* セッション一覧 */}
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                    {(['all', 'completed', 'in_progress'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${filter === f ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' ? 'すべて' : f === 'completed' ? '完了済み' : '途中'}
                        </button>
                    ))}
                </div>

                <div className="divide-y divide-gray-200">
                    {currentSessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">該当するセッションがありません。</div>
                    ) : (
                        currentSessions.map(session => (
                            <div key={session.session_id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded border ${session.status === 'completed' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                                                session.status === 'in_progress' ? 'bg-gray-800 text-white border-gray-800' :
                                                    'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                            {session.status === 'completed' ? '完了' : session.status === 'in_progress' ? '途中' : '中断'}
                                        </span>
                                        <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded bg-white">
                                            {session.category}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(session.updated_at)}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 line-clamp-1">{session.theme}</h3>
                                    <div className="text-xs text-gray-500 mt-1">
                                        ターン数: {session.turn_count} | 平均スコア: {session.average_score?.toFixed(2) || '-'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {session.status === 'in_progress' ? (
                                        <button
                                            onClick={() => navigate(`/session/${session.session_id}`)}
                                            className="flex-1 sm:flex-none px-4 py-1.5 bg-gray-800 text-white text-sm font-bold rounded hover:bg-gray-700 transition-colors"
                                        >
                                            再開
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/result/${session.session_id}`)}
                                            className="flex-1 sm:flex-none px-4 py-1.5 bg-white text-gray-800 border border-gray-300 text-sm font-bold rounded hover:bg-gray-50 transition-colors"
                                        >
                                            詳細
                                        </button>
                                    )}
                                    {/* 削除メニュー */}
                                    <button
                                        onClick={() => handleDelete(session.session_id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 border border-transparent hover:border-red-200 hover:bg-red-50 rounded transition-colors"
                                        title="削除"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 flex justify-center gap-2 bg-gray-50">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            前へ
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-600">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            次へ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};