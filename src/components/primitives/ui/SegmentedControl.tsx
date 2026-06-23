import {Pressable, View} from 'react-native';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {Typography} from './Typography';

interface SegmentOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    options: readonly SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
}: SegmentedControlProps<T>) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    return (
        <View className="flex-row rounded-xl bg-muted p-1">
            {options.map(option => {
                const isActive = option.value === value;
                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        className="flex-1 items-center justify-center rounded-lg py-2"
                        style={isActive ? {backgroundColor: palette.card} : undefined}
                    >
                        <Typography
                            variant="body-sm"
                            className="font-semibold"
                            style={{color: isActive ? palette.foreground : palette.mutedForeground}}
                        >
                            {option.label}
                        </Typography>
                    </Pressable>
                );
            })}
        </View>
    );
}
