import {Pressable, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {cn} from '@/src/lib/utils';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

interface SearchSelectProps<T> {
    label?: string;
    placeholder?: string;
    value?: T;
    onSelect: (item: T) => void;
    getLabel: (item: T) => string;
    items?: T[];
    onPress?: () => void;
    disabled?: boolean;
    error?: string;
}

export function SearchSelect<T>({
    label,
    placeholder = 'Search...',
    value,
    onSelect,
    getLabel,
    items,
    onPress,
    disabled = false,
    error,
}: SearchSelectProps<T>) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    return (
        <View className="gap-1.5">
            {label && (
                <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
            )}
            <Pressable
                onPress={onPress}
                disabled={disabled}
                className={cn(
                    'flex-row items-center justify-between rounded-md border bg-background px-4',
                    error ? 'border-destructive' : 'border-input',
                    disabled && 'opacity-40',
                )}
                style={{height: 48}}
            >
                <Typography
                    variant="body"
                    className={cn(value ? 'text-foreground' : 'text-muted-foreground')}
                >
                    {value ? getLabel(value) : placeholder}
                </Typography>
                <Ionicons name="search" size={18} color={palette.mutedForeground}/>
            </Pressable>
            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
