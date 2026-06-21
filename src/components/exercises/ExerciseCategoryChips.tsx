import {Pressable, ScrollView} from 'react-native';
import {cn} from '@/src/lib/utils';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {useGetReferenceData} from '@/src/api/generated/reference-data/reference-data';
import {ReferenceDataType} from '@/src/constants/referenceDataTypes';
import type {ExerciseFilterRequestExerciseCategory as ExerciseCategory} from '@/src/api/generated/model';

interface ExerciseCategoryChipsProps {
    selected: ExerciseCategory | undefined;
    onSelect: (category: ExerciseCategory | undefined) => void;
}

export function ExerciseCategoryChips({selected, onSelect}: ExerciseCategoryChipsProps) {
    const {data} = useGetReferenceData(ReferenceDataType.EXERCISE_CATEGORY);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap: 8, paddingHorizontal: 24, paddingBottom: 8}}
        >
            <Chip
                label="All"
                isActive={selected === undefined}
                onPress={() => onSelect(undefined)}
            />
            {data?.map(item => {
                const key = item.key as ExerciseCategory | undefined;
                if (!key) return null;
                return (
                    <Chip
                        key={key}
                        label={item.value ?? key}
                        isActive={selected === key}
                        onPress={() => onSelect(selected === key ? undefined : key)}
                    />
                );
            })}
        </ScrollView>
    );
}

interface ChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

function Chip({label, isActive, onPress}: ChipProps) {
    return (
        <Pressable
            onPress={onPress}
            className={cn(
                'rounded-full px-4 py-1.5 border',
                isActive ? 'bg-primary border-primary' : 'bg-transparent border-border',
            )}
        >
            <Typography
                variant="caption"
                className={cn('font-medium', isActive ? 'text-primary-foreground' : 'text-muted-foreground')}
            >
                {label}
            </Typography>
        </Pressable>
    );
}
