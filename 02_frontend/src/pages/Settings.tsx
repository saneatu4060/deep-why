import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings, checkOllamaHealth, deleteAllData } from '../api/settings';

export const Settings = () => {
    const navigate = useNavigate();

    // 状態管理
    const [isOllamaConnected, setIsOllamaConnected] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [minTurns, setMinTurns] = useState<number>(3);
    const [maxTurns, setMaxTurns] = useState<number>(5);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 画面表示時に初期データ取得と接続確認を実行[2]
    useEffect(() => {
        checkConnection();
        fetchSettings();
    }, []);

    const checkConnection = async () => {
        setIsChecking(true);
        try {
            const res = await checkOllamaHealth();
            setIsOllamaConnected(res.status === 'ok');
        } catch {
            setIsOllamaConnected(false);
        } finally {
            setIsChecking(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setMinTurns(data.min_turns);
            setMaxTurns(data.max_turns);
        } catch (e) {
            console.error('設定の取得に失敗しました', e);
        }
    };

    const handleSaveSettings = async () => {
        // バリデーションチェック[2]
        if (minTurns < 1) {
            setErrorMsg('最小ターン数は1以上にしてください。');
            return;
        }
        if (maxTurns > 10) {
            setErrorMsg('最大ターン数は10以下にしてください。');
            return;
        }
        if (minTurns > maxTurns) {
            setErrorMsg('最小ターン数は最大ターン数以下の値にしてください。');
            return;
        }

        setErrorMsg('');
        setIsSaving(true);
        try {
            await updateSettings({ min_turns: minTurns, max_turns: maxTurns });
            alert('設定を保存しました。');
        } catch (e) {
            console.error('設定の保存に失敗しました', e);
            alert('設定の保存に失敗しました。');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteData = async () => {
        if (window.confirm('削除すると復元できません。本当に削除しますか？')) { // [2]
            try {
                await deleteAllData();
                alert('全データを削除しました。');
                navigate('/'); // 削除後はS01へ遷移[2]
            } catch (e) {
                console.error('データの削除に失敗しました', e);
                alert('データの削除に失敗しました。');
            }
        }
    };

    return (
        <div className="flex flex-col gap-8 font-serif">
            <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2">設定</h1>

            {/* Ollama接続状態 */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Ollama 接続状態</h2>
                    <button
                        onClick={checkConnection}
                        disabled={isChecking}
                        className="text-sm px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        {isChecking ? '確認中...' : '再確認'}
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-2">
                    {/* 緑/赤インジケーター[2] */}
                    <div className={`w-3 h-3 rounded-full ${isOllamaConnected ? 'bg-green-500' : isOllamaConnected === false ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    <span className="font-medium text-gray-800">
                        {isOllamaConnected ? '接続中 (localhost:11434)' : isOllamaConnected === false ? '未接続' : '確認中...'}
                    </span>
                </div>

                {/* 未接続時のコマンド表示[2] */}
                {isOllamaConnected === false && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded text-sm">
                        <p className="font-bold mb-1">Ollamaが起動していません</p>
                        <p>ターミナルを開き、以下のコマンドを実行してOllamaを起動してください：</p>
                        <code className="block mt-2 bg-white px-3 py-2 border border-red-300 rounded font-mono text-gray-800">
                            ollama serve
                        </code>
                    </div>
                )}
            </div>

            {/* セッション設定 */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">セッション設定</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最小ターン数 (min_turns)</label>
                        <input
                            type="number"
                            min={1}
                            max={maxTurns}
                            value={minTurns}
                            onChange={(e) => setMinTurns(parseInt(e.target.value) || 1)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-gray-400 focus:border-gray-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">セッションが完了可能になるまでの最低往復回数（1以上）</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最大ターン数 (max_turns)</label>
                        <input
                            type="number"
                            min={minTurns}
                            max={10}
                            value={maxTurns}
                            onChange={(e) => setMaxTurns(parseInt(e.target.value) || minTurns)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-gray-400 focus:border-gray-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">強制的にセッションを完了させる最大往復回数（10以下）</p>
                    </div>
                </div>

                {errorMsg && <p className="text-red-600 text-sm mb-4 font-bold">{errorMsg}</p>}

                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving || !!errorMsg}
                        className="px-6 py-2 bg-gray-800 text-white font-bold rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? '保存中...' : '設定を保存'}
                    </button>
                </div>

                <hr className="my-6 border-gray-200" />

                {/* スコア閾値（表示のみ）[2] */}
                <div>
                    <h3 className="text-md font-bold text-gray-800 mb-2">スコア閾値</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        現在の閾値は、これまでの成長に合わせて自動的に計算されています。
                    </p>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500">
                        初期値の0.50から始まり、直近の平均スコアに応じて最大0.85まで自動で調整される仕組みです（手動変更不可）。
                    </div>
                </div>
            </div>

            {/* データ管理 */}
            <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-sm border-t-4 border-t-red-600">
                <h2 className="text-lg font-bold text-gray-800 mb-2">データ管理</h2>
                <p className="text-sm text-gray-600 mb-4">
                    思考データ（SQLite）およびベクトルデータ（ChromaDB）をすべて削除します。この操作は取り消せません。
                </p>
                <button
                    onClick={handleDeleteData}
                    className="px-6 py-2 bg-white text-red-600 font-bold rounded border border-red-200 hover:bg-red-50 transition-colors"
                >
                    全データを削除
                </button>
            </div>
        </div>
    );
};