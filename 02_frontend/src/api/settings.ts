import { apiClient } from './client';
import type { SettingsResponse, SettingsUpdateRequest } from '../types';

/** GET /settings: 設定の取得 */
export const getSettings = async (): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>('/settings');
    return response.data;
};

/** PATCH /settings: 設定の更新 */
export const updateSettings = async (data: SettingsUpdateRequest): Promise<any> => {
    const response = await apiClient.patch('/settings', data);
    return response.data;
};

/** GET /health/ollama: Ollama接続確認 */
export const checkOllamaHealth = async (): Promise<any> => {
    const response = await apiClient.get('/health/ollama');
    return response.data;
};

/** DELETE /data: 全データの削除 */
export const deleteAllData = async (): Promise<any> => {
    const response = await apiClient.delete('/data');
    return response.data;
};