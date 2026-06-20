import {Pressable, TextInput, TextInputProps, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {cn} from '@/src/lib/utils';

interface SearchInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
    value: string;
    onChangeText: (text: string) => void;
    className?: string;
}

export function SearchInput({value, onChangeText, className, placeholder = 'Search...', ...props}: SearchInputProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    return (
        <View
            className={cn(
                'flex-row items-center gap-2 rounded-lg border border-input bg-background px-3',
                className,
            )}
            style={{height: 44}}
        >
            <Ionicons name="search-outline" size={18} color={palette.mutedForeground}/>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={palette.mutedForeground}
                className="flex-1 text-base text-foreground"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                {...props}
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={palette.mutedForeground}/>
                </Pressable>
            )}
        </View>
    );
}
