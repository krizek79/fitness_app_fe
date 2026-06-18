import {jwtDecode} from 'jwt-decode';
import {Platform} from 'react-native';
import {makeRedirectUri} from 'expo-auth-session';

const ISSUER = process.env.EXPO_PUBLIC_ISSUER_URI!;
const CLIENT_ID = process.env.EXPO_PUBLIC_CLIENT_ID!;

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
}

export interface AuthUser {
    sub: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    exp: number;
}

export function getRedirectUri(): string {
    if (Platform.OS === 'web') {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/auth/callback`;
    }
    return makeRedirectUri({scheme: 'fitness-app', path: 'auth/callback'});
}

export function getIssuerUri(): string {
    return ISSUER;
}

export function getClientId(): string {
    return CLIENT_ID;
}

/** Builds the Keycloak auth URL, skipping the login page and going straight to Google. */
export function buildWebAuthUrl(codeChallenge: string, state: string): string {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: getRedirectUri(),
        response_type: 'code',
        scope: 'openid profile email',
        kc_idp_hint: 'google',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
    });
    return `${ISSUER}/protocol/openid-connect/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
): Promise<TokenResponse> {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: getRedirectUri(),
        code_verifier: codeVerifier,
    });

    const response = await fetch(`${ISSUER}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Token exchange failed: ${text}`);
    }

    return response.json() as Promise<TokenResponse>;
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
    });

    const response = await fetch(`${ISSUER}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    return response.json() as Promise<TokenResponse>;
}

export function decodeUser(accessToken: string): AuthUser {
    return jwtDecode<AuthUser>(accessToken);
}

export function isTokenExpired(accessToken: string, bufferSeconds = 30): boolean {
    try {
        const {exp} = jwtDecode<AuthUser>(accessToken);
        return Date.now() >= (exp - bufferSeconds) * 1000;
    } catch {
        return true;
    }
}

/** Revokes the refresh token server-side so the Keycloak session is invalidated. */
export async function revokeSession(refreshToken: string): Promise<void> {
    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        refresh_token: refreshToken,
    });

    await fetch(`${ISSUER}/protocol/openid-connect/logout`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: body.toString(),
    });
    // Ignore errors — local tokens are cleared regardless.
}
