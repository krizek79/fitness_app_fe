import { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { exchangeCodeForTokens } from '@/src/lib/auth';

/**
 * Web-only screen. Keycloak redirects here after Google login with
 * ?code=...&state=... query params. On native the auth response is handled
 * directly in login.tsx via expo-auth-session, so we just redirect away.
 */
export default function AuthCallbackScreen() {
  const { code, state, error: oauthError } = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const { saveTokens } = useAuth();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (Platform.OS !== 'web') {
      router.replace('/login');
      return;
    }

    async function handleCallback() {
      if (oauthError) {
        console.error('OAuth error:', oauthError);
        router.replace('/login');
        return;
      }

      if (!code) {
        router.replace('/login');
        return;
      }

      const storedState = sessionStorage.getItem('oauth_state');
      const verifier = sessionStorage.getItem('pkce_verifier');

      if (state && storedState && state !== storedState) {
        console.error('State mismatch — possible CSRF attack');
        router.replace('/login');
        return;
      }

      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('pkce_verifier');

      try {
        const tokens = await exchangeCodeForTokens(code, verifier ?? '');
        await saveTokens(tokens.access_token, tokens.refresh_token);
        router.replace('/');
      } catch (err) {
        console.error('Token exchange failed:', err);
        router.replace('/login');
      }
    }

    handleCallback();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-muted-foreground">Signing you in…</Text>
    </View>
  );
}
