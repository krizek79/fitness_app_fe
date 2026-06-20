import {Platform, Pressable, View} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {Heading} from './Typography';

interface DetailLayoutProps {
    title: string;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Adaptive layout for detail and form screens.
 *
 * On native: renders a Stack.Screen header with the provided title and actions.
 * On web: hides the Stack header and renders a matching custom top-bar (back, title, actions).
 *
 * For web content centering, wrap each screen's ScrollView contentContainerStyle with
 * `webContentStyle` exported from this module.
 */
export function DetailLayout({title, headerRight, children}: DetailLayoutProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const router = useRouter();

    if (Platform.OS !== 'web') {
        return (
            <>
                <Stack.Screen options={{
                    headerShown: true,
                    title,
                    headerStyle: {backgroundColor: palette.card},
                    headerTintColor: palette.mutedForeground,
                    headerShadowVisible: false,
                    headerRight: headerRight ? () => <>{headerRight}</> : undefined,
                }}/>
                {children}
            </>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{headerShown: false}}/>
            <View
                className="flex-row items-center border-b border-border bg-card"
                style={{height: 56, paddingHorizontal: 16, gap: 12}}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{padding: 8, borderRadius: 8}}
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={22} color={palette.mutedForeground}/>
                </Pressable>
                <Heading level="h4" className="flex-1">{title}</Heading>
                {headerRight && (
                    <View className="flex-row items-center" style={{gap: 8}}>
                        {headerRight}
                    </View>
                )}
            </View>
            {children}
        </View>
    );
}

/** Apply to ScrollView contentContainerStyle to center content on web. */
export const webContentStyle: object = Platform.OS === 'web'
    ? {maxWidth: 720, width: '100%', alignSelf: 'center' as const}
    : {};
