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

/**
 * GET /stats/score-history
 * 長期スコア推移を取得する
 */
export const getScoreHistory = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/stats/score-history');
    return response.data;
};

/**
 * GET /stats/category-distribution
 * テーマカテゴリ分布を取得する
 */
export const getCategoryDistribution = async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/stats/category-distribution');
    return response.data;
};