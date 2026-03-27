import { apiClient } from './client';
import type { SessionResponse, CreateSessionRequest } from '../types';

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