import {Pressable, Text, View} from 'react-native';
import {useGetReferenceData} from '@/src/api/generated/reference-data/reference-data';
import {Skeleton} from '../ui/Skeleton';
import {Typography} from '../ui/Typography';
import {cn} from '@/src/lib/utils';

interface ReferenceDataChipsProps {
    label?: string;
    type: string;
    selected: readonly string[];
    onToggle: (key: string) => void;
    disabledKeys?: readonly string[];
    error?: string;
}

export function ReferenceDataChips({
    label,
    type,
    selected,
    onToggle,
    disabledKeys = [],
    error,
}: ReferenceDataChipsProps) {
    const {data, isLoading} = useGetReferenceData(type);

    return (
        <View className="gap-2">
            {label && (
                <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
            )}

            {isLoading ? (
                <View className="flex-row flex-wrap gap-2">
                    {Array.from({length: 4}).map((_, i) => (
                        <Skeleton key={i} height={32} width={80} rounded="full"/>
                    ))}
                </View>
            ) : (
                <View className="flex-row flex-wrap gap-2">
                    {data?.map(item => {
                        const key = item.key ?? '';
                        const itemLabel = item.value ?? key;
                        const isSelected = selected.includes(key);
                        const isDisabled = disabledKeys.includes(key);

                        return (
                            <Pressable
                                key={key}
                                onPress={() => !isDisabled && onToggle(key)}
                                disabled={isDisabled}
                                className={cn(
                                    'rounded-full border px-3 py-1.5',
                                    isSelected ? 'bg-primary border-primary' : 'bg-transparent border-border',
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
                                    {itemLabel}
                                </Typography>
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {error && (
                <Text className="text-xs text-destructive">{error}</Text>
            )}
        </View>
    );
}
