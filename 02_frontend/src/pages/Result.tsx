import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { apiClient } from '../api/client';
import { getTurns, getSessionResult } from '../api/sessions';
import type { SessionResponse } from '../types';

// Chart.jsの初期化
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Mermaidの初期化
mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#f9fafb',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#d1d5db',
        lineColor: '#4b5563',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#e5e7eb',
    },
});

export const Result = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [sessionInfo, setSessionInfo] = useState<SessionResponse | null>(null);
    const [turns, setTurns] = useState<any[]>([]);
    const [logicMap, setLogicMap] = useState<string | null>(null);
    const [isGeneratingMap, setIsGeneratingMap] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mermaidRef = useRef<HTMLDivElement>(null);

    // 初回データ取得（セッション情報・ターン情報）
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!sessionId) return;
                const [sessionRes, turnsRes] = await Promise.all([
                    apiClient.get<SessionResponse>(`/sessions/${sessionId}`),
                    getTurns(sessionId)
                ]);
                setSessionInfo(sessionRes.data);
                setTurns(turnsRes);
            } catch (error) {
                console.error('データの取得に失敗しました', error);
            }
        };
        fetchData();
    }, [sessionId]);

    // 論理マップ（Mermaid）のポーリング取得
    useEffect(() => {
        if (!sessionId || !isGeneratingMap) return;

        const pollInterval = setInterval(async () => {
            try {
                const result = await getSessionResult(sessionId);
                if (result.status === 'completed' && result.logic_map) {
                    setLogicMap(result.logic_map);
                    setIsGeneratingMap(false);
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('論理マップの取得に失敗しました', error);
                clearInterval(pollInterval);
            }
        }, 3000); // 3秒ごとに確認

        return () => clearInterval(pollInterval);
    }, [sessionId, isGeneratingMap]);

    // Mermaidグラフの描画
    useEffect(() => {
        if (logicMap && mermaidRef.current && !isGeneratingMap) {
            mermaidRef.current.innerHTML = '';
            mermaid.render(`mermaid-${Date.now()}`, logicMap).then((result) => {
                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = result.svg;
                }
            });
        }
    }, [logicMap, isGeneratingMap]);

    // コピー機能
    const handleCopyClaim = () => {
        const claim = turns.find(t => t.claim)?.claim || '';
        navigator.clipboard.writeText(claim);
        alert('クリップボードにコピーしました');
    };

    if (!sessionInfo) {
        return <div className="flex justify-center py-20 font-serif text-gray-500">結果を読み込んでいます...</div>;
    }

    // グラフ用のデータ整形
    const chartData = {
        labels: turns.filter(t => t.scores).map((_, i) => `Turn ${i + 1}`),
        datasets: [
            {
                label: '具体性',
                data: turns.filter(t => t.scores).map(t => t.scores.concreteness),
                borderColor: '#4b5563', // gray-600
                backgroundColor: '#4b5563',
            },
            {
                label: '因果性',
                data: turns.filter(t => t.scores).map(t => t.scores.causality),
                borderColor: '#9ca3af', // gray-400
                backgroundColor: '#9ca3af',
            },
            {
                label: '定義度',
                data: turns.filter(t => t.scores).map(t => t.scores.definitiveness),
                borderColor: '#1f2937', // gray-800
                backgroundColor: '#1f2937',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: { y: { min: 0, max: 1 } },
        plugins: { legend: { position: 'bottom' as const } },
    };

    const finalClaim = turns.find(t => t.claim)?.claim || '主張文が生成されていません';

    return (
        <div className="flex flex-col gap-6 font-serif">
            {/* 完了バナー */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">思考が完了しました</h2>
                <p className="text-sm text-gray-600">
                    テーマ: <span className="font-semibold">{sessionInfo.theme}</span><br />
                    ターン数: {sessionInfo.turn_count} / 平均スコア: {sessionInfo.average_score?.toFixed(2) || '-'}
                </p>
            </div>

            {/* 主張文エリア（先行表示） */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">あなたの結論</h3>
                    <button
                        onClick={handleCopyClaim}
                        className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 transition-colors"
                    >
                        コピー
                    </button>
                </div>
                <p className="text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {finalClaim}
                </p>
            </div>

            {/* 論理マップとスコア推移（2カラム） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 論理マップエリア */}
                <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">論理マップ</h3>
                    {isGeneratingMap ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-gray-500 bg-gray-50 rounded-lg border border-gray-200 animate-pulse">
                            <p className="text-sm mb-2">論理マップを生成しています...</p>
                            <p className="text-xs text-gray-400">（30秒程度かかる場合があります）</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <div
                                ref={mermaidRef}
                                className="flex-1 overflow-auto bg-gray-50 rounded-lg border border-gray-200 p-4 flex justify-center items-center min-h-[200px]"
                            />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline text-center"
                            >
                                全画面で見る
                            </button>
                        </div>
                    )}
                </div>

                {/* スコア推移グラフ */}
                <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">スコア推移</h3>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-4 justify-center mt-4">
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-white text-gray-800 border border-gray-300 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                    ホームへ戻る
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                >
                    新しいセッションを開始
                </button>
            </div>

            {/* 全画面モーダル */}
            {isModalOpen && logicMap && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4 md:p-10">
                    <div className="bg-white rounded-xl w-full h-full flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold font-serif">論理マップ（全画面）</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-800 text-2xl font-bold px-2"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-8 bg-gray-50 flex justify-center items-start">
                            <div dangerouslySetInnerHTML={{ __html: mermaidRef.current?.innerHTML || '' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};