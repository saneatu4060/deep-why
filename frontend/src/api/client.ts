import axios from 'axios';

/**
 * FastAPIバックエンドとの通信用axiosインスタンス
 */
export const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});