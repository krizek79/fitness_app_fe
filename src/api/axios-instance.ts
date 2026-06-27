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

// Orval appends JSON request parts as plain strings. Spring's @RequestPart needs
// Content-Type: application/json on each JSON part or it falls back to octet-stream → 415.
// Web: wrap JSON strings in a Blob so the browser sets the correct part Content-Type.
// React Native: RN 0.76+ FormData has entries() like web, but new Blob([string]) in RN
// doesn't serialize correctly through the native HTTP stack. Instead we copy _parts as-is
// and patch getParts() — the method RN's XHR calls to build the native multipart body —
// to override content-type on JSON string parts.
function fixFormDataJsonParts(source: FormData): FormData {
    const rebuilt = new FormData();

    if (Platform.OS === 'web') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [key, value] of (source as any).entries()) {
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    rebuilt.append(key, new Blob([value], {type: 'application/json'}));
                } else {
                    rebuilt.append(key, value);
                }
            } else {
                rebuilt.append(key, value as Blob);
            }
        }
        return rebuilt;
    }

    // React Native: copy _parts then patch getParts() to set application/json
    // on JSON string parts without touching the actual Blob/file parts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts: Array<[string, unknown]> = (source as any)._parts ?? [];
    for (const [key, value] of parts) {
        rebuilt.append(key, value as string | Blob);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const origGetParts = (rebuilt as any).getParts?.bind(rebuilt);
    if (origGetParts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rebuilt as any).getParts = () =>
            (origGetParts() as Array<Record<string, unknown>>).map(part => {
                const str = part.string as string | undefined;
                if (typeof str === 'string') {
                    const t = str.trim();
                    if (t.startsWith('{') || t.startsWith('[')) {
                        return {
                            ...part,
                            headers: {...(part.headers as object), 'content-type': 'application/json'},
                        };
                    }
                }
                return part;
            });
    }

    return rebuilt;
}

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

    // React Native's FormData returns '[object Object]' from Object.prototype.toString,
    // so axios's isFormData() check fails. axios then transforms FormData as a plain
    // object, producing a garbage body with Content-Type: application/octet-stream.
    // Duck-typing the check and bypassing transformRequest lets RN's XHR layer
    // receive the original FormData and set the multipart boundary itself.
    if (config.data != null && typeof (config.data as FormData).append === 'function') {
        // Orval appends JSON fields as plain strings: formData.append('request', JSON.stringify(...))
        // Spring's @RequestPart deserialiser requires Content-Type: application/json on that part.
        // Without it, Spring sees raw bytes → application/octet-stream → 415.
        // We rebuild the FormData, promoting JSON-string parts to Blob(application/json).
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any).transformRequest = [(data: unknown) => fixFormDataJsonParts(data as FormData)];
        // Let the browser/RN network layer set Content-Type with the generated boundary.
        config.headers.delete('Content-Type');
    }

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
        // Silently swallow requests aborted by navigation or component unmount.
        if (axios.isCancel(error)) return Promise.reject(error);

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
