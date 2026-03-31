import type { TurnScores } from '../types';

interface ScoreBarProps {
    scores: TurnScores | null;
    reason: string | null;
    isLoading: boolean;
}

export const ScoreBar = ({ scores, reason, isLoading }: ScoreBarProps) => {
    // 初期状態（スコアがまだない）
    if (!scores && !isLoading) {
        return (
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm font-serif">
                <p className="text-sm text-gray-500 text-center py-2">思考を入力して送信すると、ここに解析スコアが表示されます</p>
            </div>
        );
    }

    // 待機中（ローディング）のアニメーション表示
    if (isLoading || !scores) {
        return (
            <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm font-serif animate-pulse">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    {[3 - 5].map((i) => (
                        <div key={i} className="flex-1 w-full space-y-2">
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
                <p className="text-xs text-center text-gray-500 mt-2">思考を解析中...</p>
            </div>
        );
    }

    // 最低スコアの特定
    const metrics = [
        { key: 'concreteness', label: '具体性', value: scores.concreteness },
        { key: 'causality', label: '因果性', value: scores.causality },
        { key: 'definitiveness', label: '定義度', value: scores.definitiveness },
    ];
    const minScore = Math.min(...metrics.map((m) => m.value));

    return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm font-serif">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                {metrics.map((metric) => {
                    const isMin = metric.value === minScore;
                    return (
                        <div key={metric.key} className="w-full flex-1">
                            <div className="flex justify-between text-xs mb-1">
                                {/* 最低指標は赤色でハイライト */}
                                <span className={isMin ? 'font-bold text-red-800' : 'text-gray-600'}>
                                    {metric.label}
                                </span>
                                <span className={isMin ? 'font-bold text-red-800' : 'text-gray-600'}>
                                    {metric.value.toFixed(2)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-500 ${isMin ? 'bg-red-800' : 'bg-gray-800'
                                        }`}
                                    style={{ width: `${metric.value * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 採点理由を1文で併記 */}
            {reason && (
                <div className="text-center mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                        <span className="text-gray-500 mr-2">採点理由:</span>
                        {reason}
                    </p>
                </div>
            )}
        </div>
    );
};