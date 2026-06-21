import {Pressable, Text, View} from 'react-native';
import {cn} from '@/src/lib/utils';
import {Typography} from '../ui/Typography';

interface MultiSelectChipsProps<T extends string> {
    label?: string;
    options: readonly T[];
    selected: readonly T[];
    onToggle: (value: T) => void;
    getLabel: (value: T) => string;
    disabledOptions?: readonly T[];
    error?: string;
}

export function MultiSelectChips<T extends string>({
    label,
    options,
    selected,
    onToggle,
    getLabel,
    disabledOptions = [],
    error,
}: MultiSelectChipsProps<T>) {
    return (
        <View className="gap-2">
            {label && (
                <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
            )}
            <View className="flex-row flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selected.includes(option);
                    const isDisabled = disabledOptions.includes(option);

                    return (
                        <Pressable
                            key={option}
                            onPress={() => !isDisabled && onToggle(option)}
                            disabled={isDisabled}
                            className={cn(
                                'rounded-full border px-3 py-1.5',
                                isSelected
                                    ? 'bg-primary border-primary'
                                    : 'bg-transparent border-border',
                                isDisabled && 'opacity-30',
                            )}
                        >
                            <Typography
                                variant="caption"
                                className={cn(
                                    'font-medium',
                                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground',
                                )}
                            >
                                {getLabel(option)}
                            </Typography>
                        </Pressable>
                    );
                })}
            </View>
            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
