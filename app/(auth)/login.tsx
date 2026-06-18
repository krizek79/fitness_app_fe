import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/context/AuthContext';
import {
  buildWebAuthUrl,
  exchangeCodeForTokens,
  getClientId,
  getIssuerUri,
  getRedirectUri,
} from '@/src/lib/auth/auth';
import { generateCodeChallenge, generateCodeVerifier } from '@/src/lib/auth/pkce';

// Required for expo-auth-session to complete the session on Android/iOS.
WebBrowser.maybeCompleteAuthSession();

const ISSUER_URI = getIssuerUri();
const CLIENT_ID = getClientId();

export default function LoginScreen() {
  const { saveTokens } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Native: PKCE auth request via expo-auth-session ────────────────────────

  const discovery = AuthSession.useAutoDiscovery(ISSUER_URI);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri: getRedirectUri(),
      scopes: ['openid', 'profile', 'email'],
      extraParams: { kc_idp_hint: 'google' },
    },
    discovery,
  );

  // Handle the auth response returned by expo-auth-session (native only).
  useEffect(() => {
    if (Platform.OS === 'web' || !response) return;

    async function handleNativeResponse() {
      if (response?.type !== 'success') {
        if (response?.type === 'error') {
          setError(response.error?.message ?? 'Authentication failed');
        }
        setIsLoading(false);
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens(
          response.params.code,
          request!.codeVerifier!,
        );
        await saveTokens(tokens.access_token, tokens.refresh_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Token exchange failed');
      } finally {
        setIsLoading(false);
      }
    }

    handleNativeResponse();
  }, [response]);

  // ─── Web: PKCE redirect (no popup) ──────────────────────────────────────────

  async function handleWebLogin() {
    setIsLoading(true);
    setError(null);

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateCodeVerifier(); // reuse for random state value

    sessionStorage.setItem('pkce_verifier', verifier);
    sessionStorage.setItem('oauth_state', state);

    window.location.href = buildWebAuthUrl(challenge, state);
  }

  // ─── Native login trigger ────────────────────────────────────────────────────

  function handleNativeLogin() {
    setIsLoading(true);
    setError(null);
    promptAsync();
  }

  const handleLogin = Platform.OS === 'web' ? handleWebLogin : handleNativeLogin;

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <View className="mb-16 items-center">
        <Text className="text-4xl font-bold text-primary">Fitness App</Text>
        <Text className="mt-2 text-base text-muted-foreground">Track your progress</Text>
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={isLoading || (Platform.OS !== 'web' && !request)}
        className="w-full flex-row items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-4 active:opacity-70 disabled:opacity-40"
      >
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-base font-semibold text-card-foreground">
            Continue with Google
          </Text>
        )}
      </Pressable>

      {error && (
        <Text className="mt-4 text-center text-sm text-destructive">{error}</Text>
      )}
    </View>
  );
}
