import {Pressable} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {Typography} from './Typography';

interface SortToggleProps {
    direction: 'ASC' | 'DESC';
    onToggle: () => void;
    labelAsc?: string;
    labelDesc?: string;
    accessibilityLabel?: string;
}

export function SortToggle({
    direction,
    onToggle,
    labelAsc = 'A–Z',
    labelDesc = 'Z–A',
    accessibilityLabel,
}: SortToggleProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    return (
        <Pressable
            onPress={onToggle}
            className="flex-row items-center gap-1 rounded-lg border border-input bg-background px-3"
            style={{height: 44}}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? `Sort ${direction === 'ASC' ? 'ascending' : 'descending'}`}
        >
            <Ionicons
                name={direction === 'ASC' ? 'arrow-up' : 'arrow-down'}
                size={16}
                color={palette.mutedForeground}
            />
            <Typography variant="body-sm" className="text-muted-foreground">
                {direction === 'ASC' ? labelAsc : labelDesc}
            </Typography>
        </Pressable>
    );
}
