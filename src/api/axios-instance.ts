import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {Platform} from 'react-native';
import {tokenState} from '@/src/lib/auth/tokenState';
import {tokenStorage} from '@/src/lib/auth/tokenStorage';
import {refreshTokens} from '@/src/lib/auth/auth';
import {parseApiError} from '@/src/lib/api/error';
import {toast} from '@/src/lib/toast';

const getBaseUrl = () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
    if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
        return baseUrl.replace('localhost', '10.0.2.2');
    }
    return baseUrl;
};

export const AXIOS_INSTANCE = axios.create({
    baseURL: getBaseUrl(),
    headers: {'Content-Type': 'application/json'},
});

// ─── Request interceptor: attach the Bearer token and a per-request trace ID ─

function generateTraceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

AXIOS_INSTANCE.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenState.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Trace-Id'] = generateTraceId();
    return config;
});

// ─── Response interceptor: refresh on 401 ────────────────────────────────────
//
// All requests that fail with 401 while a refresh is in flight are queued and
// replayed once the refresh resolves (or rejected if it fails). This prevents
// parallel requests from each triggering their own refresh race.

type QueueEntry = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
    queue.forEach(({resolve, reject}) => {
        if (token) resolve(token);
        else reject(error);
    });
    queue = [];
}

AXIOS_INSTANCE.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Let the refresh logic below handle 401. For everything else, show a toast.
        if (error.response?.status !== 401 || originalRequest._retry) {
            const parsed = parseApiError(error);
            // Use error kind as the dedup key so "server down" never spams.
            const key = parsed.kind === 'network' || parsed.kind === 'server'
                ? parsed.kind
                : `${parsed.status ?? 'unknown'}:${originalRequest?.url ?? ''}`;
            toast.error(parsed.title, parsed.detail, key);
            return Promise.reject(error);
        }

        const refreshToken = tokenState.getRefreshToken();
        if (!refreshToken) {
            tokenState.triggerLogout();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                queue.push({resolve, reject});
            }).then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return AXIOS_INSTANCE(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const tokens = await refreshTokens(refreshToken);

            tokenState.set(tokens.access_token, tokens.refresh_token);
            await Promise.all([
                tokenStorage.setAccessToken(tokens.access_token),
                tokenStorage.setRefreshToken(tokens.refresh_token),
            ]);

            processQueue(null, tokens.access_token);

            originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
            return AXIOS_INSTANCE(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            tokenState.triggerLogout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> =>
    AXIOS_INSTANCE(config).then((response: AxiosResponse<T>) => response.data);

export default customInstance;
