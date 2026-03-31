import type { SessionResponse } from '../types';

interface SessionCardProps {
    session: SessionResponse;
    // S02（再開）またはS03（詳細）への遷移を親コンポーネントから制御するための関数
    onClickAction: (sessionId: string, status: SessionResponse['status']) => void;
}

export const SessionCard = ({ session, onClickAction }: SessionCardProps) => {
    const isInProgress = session.status === 'in_progress';

    // 日付のフォーマット（例: 2026/03/25）
    const formattedDate = new Date(session.updated_at).toLocaleDateString('ja-JP');

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-sm mb-3 font-serif transition-shadow hover:shadow-md">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    {/* モノトーン調のバッジ */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isInProgress
                        ? 'bg-white text-gray-800 border-gray-400'
                        : 'bg-gray-800 text-white border-gray-800'
                        }`}>
                        {isInProgress ? '途中' : '完了'}
                    </span>
                    <span className="text-xs text-gray-500">{session.category}</span>
                    <span className="text-xs text-gray-400">{formattedDate}</span>
                </div>

                <p className="font-semibold text-gray-800 text-sm mt-1">{session.theme}</p>

                <p className="text-xs text-gray-500">
                    ターン数: {session.turn_count}
                    {session.average_score !== null && ` | 平均スコア: ${session.average_score.toFixed(2)}`}
                </p>
            </div>

            {/* モノトーン調のボタン */}
            <button
                onClick={() => onClickAction(session.session_id, session.status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${isInProgress
                    ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-700'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                    }`}
            >
                {isInProgress ? '再開' : '詳細'}
            </button>
        </div>
    );
};