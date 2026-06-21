import {ActivityIndicator, Platform, Pressable} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';

interface WebRefreshButtonProps {
    onRefresh: () => void;
    isRefreshing: boolean;
}

/** Refresh button rendered only on web (pull-to-refresh is unavailable there). */
export function WebRefreshButton({onRefresh, isRefreshing}: WebRefreshButtonProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    if (Platform.OS !== 'web') return null;

    return (
        <Pressable
            onPress={onRefresh}
            disabled={isRefreshing}
            className="w-11 h-11 rounded-lg border border-input bg-background items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Refresh"
        >
            {isRefreshing
                ? <ActivityIndicator size="small" color={palette.mutedForeground}/>
                : <Ionicons name="refresh" size={18} color={palette.mutedForeground}/>
            }
        </Pressable>
    );
}
