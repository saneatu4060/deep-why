import { apiClient } from './client';
import type { SessionResponse, CreateSessionRequest, SessionUpdateRequest, TurnRequest, TurnResponse } from '../types';

/**
 * GET /sessions
 * 過去セッション一覧（直近のもの）を取得する
 */
export const getSessions = async (): Promise<SessionResponse[]> => {
    const response = await apiClient.get<SessionResponse[]>('/sessions');
    return response.data;
};

/**
 * POST /sessions
 * 新しいセッションを作成・開始する
 */
export const createSession = async (data: CreateSessionRequest): Promise<any> => {
    // ※現在のバックエンドはスタブで {"message": "stub: create_session"} を返す状態です
    const response = await apiClient.post('/sessions', data);
    return response.data;
};

// ==========================================
// 以下、S02用のAPI通信関数
// ==========================================

/**
 * PATCH /sessions/{session_id}
 * セッションのステータスを更新する（S02途中離脱の abandoned 更新などに使用）
 */
export const updateSessionStatus = async (sessionId: string, data: SessionUpdateRequest): Promise<any> => {
    const response = await apiClient.patch(`/sessions/${sessionId}`, data);
    return response.data;
};

/**
 * POST /sessions/{session_id}/turns
 * ユーザーの発言を送信し、採点結果とAIの問いを受け取る
 */
export const createTurn = async (sessionId: string, data: TurnRequest): Promise<TurnResponse> => {
    const response = await apiClient.post<TurnResponse>(`/sessions/${sessionId}/turns`, data);
    return response.data;
};

/**
 * GET /sessions/{session_id}/turns
 * 過去のターン一覧を取得する（S02再開時に使用）
 */
export const getTurns = async (sessionId: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>(`/sessions/${sessionId}/turns`);
    return response.data;
};