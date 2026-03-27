// ==========================================
// 統計・成長記録系の型定義
// ==========================================

/**
 * GET /stats/summary のレスポンス型
 */
export interface StatsSummaryResponse {
    average_score: number;
    most_improved_metric: string;
    consecutive_days: number;
}

// ==========================================
// セッション系の型定義
// ==========================================

/**
 * GET /sessions や GET /sessions/{session_id} のレスポンス型
 */
export interface SessionResponse {
    session_id: string;
    theme: string;
    category: string;
    // ステータスは「思考中」「完了」「途中離脱」の3つのリテラル型で厳密に定義
    status: 'in_progress' | 'completed' | 'abandoned';
    created_at: string;
    updated_at: string;
    turn_count: number;
    // 進行中の場合はスコアが存在しないため null を許容
    average_score: number | null;
}

/**
 * POST /sessions のリクエストボディ型
 */
export interface CreateSessionRequest {
    theme: string;
    category: string;
}