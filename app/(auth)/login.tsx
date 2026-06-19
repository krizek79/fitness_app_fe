import {useEffect, useState} from 'react';
import {Platform, View} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {useAuth} from '@/src/context/AuthContext';
import {
    buildWebAuthUrl,
    exchangeCodeForTokens,
    getClientId,
    getIssuerUri,
    getRedirectUri,
} from '@/src/lib/auth/auth';
import {generateCodeChallenge, generateCodeVerifier} from '@/src/lib/auth/pkce';
import {Button} from '@/src/components/ui/Button';
import {Divider} from '@/src/components/ui/Divider';
import {Heading, Typography} from '@/src/components/ui/Typography';

// Required for expo-auth-session to complete the session on Android/iOS.
WebBrowser.maybeCompleteAuthSession();

const ISSUER_URI = getIssuerUri();
const CLIENT_ID = getClientId();

const isWeb = Platform.OS === 'web';

export default function LoginScreen() {
    const {saveTokens} = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─── Native: PKCE auth request via expo-auth-session ────────────────────────

    const discovery = AuthSession.useAutoDiscovery(ISSUER_URI);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: CLIENT_ID,
            redirectUri: getRedirectUri(),
            scopes: ['openid', 'profile', 'email'],
            extraParams: {kc_idp_hint: 'google'},
        },
        discovery,
    );

    // Handle the auth response returned by expo-auth-session (native only).
    useEffect(() => {
        if (isWeb || !response) return;

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
        const state = generateCodeVerifier();

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

    const handleLogin = isWeb ? handleWebLogin : handleNativeLogin;

    // ─── Shared login card content ───────────────────────────────────────────────

    const content = (
        <>
            <View className="mb-8 items-center">
                <Heading level="h1" className="text-center">
                    Welcome to <Heading level="h1" className="text-primary">Fitness App</Heading>
                </Heading>
            </View>

            <Divider label="Sign in to continue"/>

            <View className="mt-6 gap-3">
                <Button
                    label="Continue with Google"
                    onPress={handleLogin}
                    variant="ghost"
                    loading={isLoading}
                    disabled={!isWeb && !request}
                    icon={<AntDesign name="google" size={20} color="#4285F4"/>}
                />

                {error && (
                    <Typography variant="muted" className="text-center text-destructive">
                        {error}
                    </Typography>
                )}
            </View>
        </>
    );

    // ─── Web: centered card layout ───────────────────────────────────────────────

    if (isWeb) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-4">
                <View className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
                    {content}
                </View>
                <Typography variant="muted" className="mt-6 text-center text-xs">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Typography>
            </View>
        );
    }

    // ─── Native: full-screen layout ──────────────────────────────────────────────

    return (
        <View className="flex-1 justify-center bg-background px-8">
            {content}
            <Typography variant="muted" className="mt-6 text-center text-xs">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </Typography>
        </View>
    );
}
