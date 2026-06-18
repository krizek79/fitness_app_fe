/**
 * In-memory token cache used by the Axios interceptors so they don't need
 * to do async SecureStore reads on every request. AuthContext keeps this in
 * sync whenever tokens are saved or cleared.
 */

type LogoutFn = () => void;

let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _onLogout: LogoutFn | null = null;

export const tokenState = {
    getAccessToken: () => _accessToken,
    getRefreshToken: () => _refreshToken,
    set: (accessToken: string, refreshToken: string) => {
        _accessToken = accessToken;
        _refreshToken = refreshToken;
    },
    clear: () => {
        _accessToken = null;
        _refreshToken = null;
    },
    registerLogout: (fn: LogoutFn) => {
        _onLogout = fn;
    },
    triggerLogout: () => {
        _onLogout?.();
    },
};
