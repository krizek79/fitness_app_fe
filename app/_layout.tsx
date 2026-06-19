import {useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {Stack, useRouter, useSegments} from 'expo-router';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider, useAuth} from '@/src/context/AuthContext';
import {UserProvider} from '@/src/context/UserContext';
import {ToastContainer} from '@/src/components/ui/ToastContainer';
import './globals.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // No retries on network errors — the server is unreachable, not flaky.
            retry: (failureCount, error) => {
                if (error instanceof Error && 'response' in error && !(error as any).response) {
                    return false;
                }
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
        },
    },
});

/**
 * Watches auth state and redirects to /login when unauthenticated, or back to
 * the app root when authenticated. The /auth/callback route is always reachable
 * so the web OAuth redirect can complete.
 */
function AuthGate({children}: { children: React.ReactNode }) {
    const {isAuthenticated, isLoading} = useAuth();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const firstSegment = segments[0] as string | undefined;
        const inPublicRoute = firstSegment === '(auth)' || firstSegment === 'auth';

        if (!isAuthenticated && !inPublicRoute) {
            router.replace('/login');
        } else if (isAuthenticated && inPublicRoute) {
            router.replace('/home');
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" color={palette.primary}/>
            </View>
        );
    }

    return <>{children}</>;
}

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <UserProvider>
                    <View style={{flex: 1}}>
                        <AuthGate>
                            <Stack screenOptions={{headerShown: false}}/>
                        </AuthGate>
                        <ToastContainer/>
                    </View>
                </UserProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
