import { apiClient } from './client';
import type { StatsSummaryResponse } from '../types';

/**
 * GET /stats/summary
 * 成長ステータスのサマリーを取得する
 */
export const getStatsSummary = async (): Promise<StatsSummaryResponse> => {
    const response = await apiClient.get<StatsSummaryResponse>('/stats/summary');
    return response.data;
};  