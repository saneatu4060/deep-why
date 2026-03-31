import type { TurnScores } from '../types';

interface ChatBubbleProps {
    role: 'user' | 'ai';
    text: string;
    scores?: TurnScores;
    reason?: string;
}

export const ChatBubble = ({ role, text, scores, reason }: ChatBubbleProps) => {
    const isUser = role === 'user';

    return (
        <div className={`flex flex-col mb-6 font-serif ${isUser ? 'items-end' : 'items-start'}`}>
            <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-xl text-sm leading-relaxed ${isUser
                    ? 'bg-gray-800 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border-2 border-purple-300 rounded-bl-none shadow-sm'
                    }`}
            >
                {/* テキスト内の改行を反映させて表示する */}
                {text.split('\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        <br />
                    </span>
                ))}
            </div>

            {/* AIの問いの場合、直下に採点バッジを表示 */}
            {!isUser && scores && (
                <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg max-w-[85%] sm:max-w-[75%]">
                    <span className="font-semibold text-gray-600">採点結果：</span>
                    具体性 {scores.concreteness.toFixed(2)} | 因果性 {scores.causality.toFixed(2)} | 定義度 {scores.definitiveness.toFixed(2)}
                    {reason && <span className="block mt-0.5 text-gray-400">理由: {reason}</span>}
                </div>
            )}
        </div>
    );
};