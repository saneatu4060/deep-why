import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ScoreBar } from '../components/ScoreBar';
import { ChatBubble } from '../components/ChatBubble';
import { apiClient } from '../api/client';
import { createTurn, getTurns, updateSessionStatus } from '../api/sessions';
import type { SessionResponse } from '../types';

export const Session = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [sessionInfo, setSessionInfo] = useState<SessionResponse | null>(null);
    const [turns, setTurns] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');

    // 状態管理
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // チャットの一番下へスクロールするための参照
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const MAX_TURNS = 5; // 要件定義(min=3, max=5)に基づく固定値

    // 初回データ取得（セッション情報と過去ターン）
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
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [sessionId]);

    // 新しいターンが追加されたり、ローディング状態が変わるたびに下へスクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [turns, isLoading]);

    // 途中離脱処理（戻るボタン）
    const handleBack = async () => {
        if (window.confirm('これまでの思考プロセスは保存されますが、セッションは中断されます。戻りますか？')) {
            if (sessionId) {
                try {
                    // バックエンドに途中離脱(abandoned)を通知
                    await updateSessionStatus(sessionId, { status: 'abandoned' });
                } catch (error) {
                    console.error('ステータス更新に失敗しました', error);
                }
            }
            navigate('/');
        }
    };

    // Enterで送信、Shift+Enterで改行
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ターン送信処理
    const handleSubmit = async () => {
        if (!inputText.trim() || isLoading || !sessionId) return;

        const currentText = inputText.trim();
        setInputText('');
        setIsLoading(true);

        // ユーザーの発言を画面に即座に反映させるための仮オブジェクト
        const tempTurnId = `temp_${Date.now()}`;
        setTurns(prev => [...prev, { turn_id: tempTurnId, user_utterance: currentText }]);

        try {
            const response = await createTurn(sessionId, { user_utterance: currentText });

            // 仮のユーザー発言を、サーバーから返ってきた正式なデータ（AIの問いや採点結果）で上書き
            setTurns(prev => {
                const filtered = prev.filter(t => t.turn_id !== tempTurnId);
                return [
                    ...filtered,
                    {
                        turn_id: response.turn_id,
                        user_utterance: currentText,
                        ai_question: response.ai_question,
                        scores: response.scores,
                        reason: response.reason
                    }
                ];
            });

            // 完了条件を満たした場合、S03結果画面へ遷移
            if (response.is_completed) {
                navigate(`/result/${sessionId}`);
            }
        } catch (error) {
            console.error('ターンの送信に失敗しました', error);
            alert('採点に失敗しました。もう一度送信してください。');
            // エラー時は仮のターンを消す
            setTurns(prev => prev.filter(t => t.turn_id !== tempTurnId));
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex justify-center py-20 font-serif text-gray-500">セッションを読み込んでいます...</div>;
    }

    // 最新ターンのスコア情報を取得（ScoreBar用）
    const latestTurnWithScores = [...turns].reverse().find(t => t.scores);
    const currentScores = latestTurnWithScores?.scores || null;
    const currentReason = latestTurnWithScores?.reason || null;

    // 送信中の仮ターンも含むため、AIからの返答（scores）があるものを正当なターンと数える
    const currentTurnCount = turns.filter(t => t.scores).length + 1;

    return (
        // App.tsxの枠組みの中で、画面高さの大部分を占めるコンテナ
        <div className="flex flex-col h-[75vh] min-h-[500px] border border-gray-300 rounded-xl overflow-hidden bg-gray-50 font-serif shadow-sm">

            {/* 1. セッションナビゲーションバー */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-300 shrink-0">
                <button
                    onClick={handleBack}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    ← 戻る
                </button>
                <span className="font-bold text-gray-800 text-sm truncate max-w-[50%] text-center">
                    {sessionInfo?.theme || 'テーマなし'}
                </span>
                <span className="text-sm font-medium text-gray-500">
                    現在ターン {Math.min(currentTurnCount, MAX_TURNS)} / {MAX_TURNS}
                </span>
            </div>

            {/* 2. スコアバーエリア */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 shrink-0">
                <ScoreBar scores={currentScores} reason={currentReason} isLoading={isLoading} />
            </div>

            {/* 3. 会話エリア */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {turns.length === 0 && (
                    <p className="text-center text-sm text-gray-400 mt-4">テーマについての思考を送信してください。</p>
                )}

                {turns.map((turn, i) => (
                    <div key={turn.turn_id || i}>
                        {/* ユーザーの送信内容 */}
                        <ChatBubble role="user" text={turn.user_utterance} />

                        {/* AIからの問い（待機中以外かつAIのテキストがある場合のみ表示） */}
                        {turn.ai_question && (
                            <ChatBubble
                                role="ai"
                                text={turn.ai_question}
                                scores={turn.scores}
                                reason={turn.reason}
                            />
                        )}
                    </div>
                ))}
                {/* スクロール追従用マーカー */}
                <div ref={messagesEndRef} />
            </div>

            {/* 4. 入力エリア */}
            <div className="p-4 bg-white border-t border-gray-300 shrink-0">
                <div className="flex gap-3">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder={isLoading ? "思考を解析しています..." : "Shift + Enter で改行、Enter で送信"}
                        className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-16 text-sm focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!inputText.trim() || isLoading}
                        className="px-6 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                        送信
                    </button>
                </div>
            </div>
        </div>
    );
};