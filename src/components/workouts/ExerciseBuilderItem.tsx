import {useState} from 'react';
import {Image, Platform, Pressable, TextInput, View} from 'react-native';
import {Control, Controller, useController, useFieldArray} from 'react-hook-form';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {METRIC_LABELS} from '@/src/lib/schemas/workouts/workoutCreate';
import type {WorkoutCreateFormValues, WorkoutExerciseFormValues} from '@/src/lib/schemas/workouts/workoutCreate';
import {MetricPickerModal} from './MetricPickerModal';
import {SetRow} from './SetRow';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

interface ExerciseBuilderItemProps {
    control: Control<WorkoutCreateFormValues>;
    exerciseIndex: number;
    exercise: WorkoutExerciseFormValues;
    onRemove: () => void;
    isDragging?: boolean;
}

export function ExerciseBuilderItem({control, exerciseIndex, exercise, onRemove, isDragging}: ExerciseBuilderItemProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const [expanded, setExpanded] = useState(false);
    const [metricPickerOpen, setMetricPickerOpen] = useState(false);

    const {fields: sets, append, remove} = useFieldArray({
        control,
        name: `workoutExercises.${exerciseIndex}.workoutExerciseSets`,
    });

    const {field: metricField} = useController({control, name: `workoutExercises.${exerciseIndex}.workoutExerciseMetric`});
    const metric = metricField.value;

    function addSet() {
        append({
            order: sets.length + 1,
            workoutExerciseSetType: 'STRAIGHT_SET',
        });
    }

    return (
        <View
            className="rounded-xl border border-border bg-card"
            style={{opacity: isDragging ? 0.8 : 1}}
        >
            {/* Header row */}
            <View className="flex-row items-center gap-3 px-4 py-3">
                {/* Drag handle — visual only; actual drag gesture comes from SortableList wrapper */}
                <Ionicons name="reorder-three-outline" size={22} color={palette.mutedForeground}/>

                <View className="bg-muted items-center justify-center overflow-hidden" style={{width: 40, height: 40, borderRadius: 8}}>
                    {exercise._exerciseThumbnailUrl ? (
                        Platform.OS === 'web' ? (
                            // @ts-ignore
                            <img src={exercise._exerciseThumbnailUrl} style={{width: 40, height: 40, objectFit: 'cover'}} alt=""/>
                        ) : (
                            <Image source={{uri: exercise._exerciseThumbnailUrl}} style={{width: 40, height: 40}} resizeMode="cover"/>
                        )
                    ) : (
                        <Ionicons name="barbell-outline" size={18} color="#9ca3af"/>
                    )}
                </View>

                <View className="flex-1">
                    <Typography variant="body" className="font-semibold text-foreground" numberOfLines={1}>
                        {exercise._exerciseTitle}
                    </Typography>
                    <Pressable onPress={() => setMetricPickerOpen(true)} hitSlop={4}>
                        <Typography variant="caption" style={{color: palette.primary}}>
                            {METRIC_LABELS[metric]} ▾
                        </Typography>
                    </Pressable>
                </View>

                <Typography variant="caption" className="text-muted-foreground">
                    {sets.length} {sets.length === 1 ? 'set' : 'sets'}
                </Typography>

                <Pressable onPress={() => setExpanded(v => !v)} hitSlop={8}>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={palette.mutedForeground}
                    />
                </Pressable>

                <Pressable onPress={onRemove} hitSlop={8}>
                    <Ionicons name="close-circle-outline" size={20} color={palette.mutedForeground}/>
                </Pressable>
            </View>

            {expanded && (
                <View className="px-4 pb-4 gap-3 border-t border-border pt-3">
                    {/* Exercise note */}
                    <Controller
                        control={control}
                        name={`workoutExercises.${exerciseIndex}.note`}
                        render={({field: {onChange, value}}) => (
                            <TextInput
                                value={value ?? ''}
                                onChangeText={onChange}
                                placeholder="Exercise note (optional)..."
                                placeholderTextColor={palette.mutedForeground}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                style={{minHeight: 36, textAlignVertical: 'top'}}
                                multiline
                            />
                        )}
                    />

                    {/* Sets */}
                    {sets.map((set, setIndex) => (
                        <SetRow
                            key={set.id}
                            control={control}
                            exerciseIndex={exerciseIndex}
                            setIndex={setIndex}
                            onRemove={() => remove(setIndex)}
                        />
                    ))}

                    {/* Add set */}
                    <Pressable
                        onPress={addSet}
                        className="flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3"
                    >
                        <Ionicons name="add" size={18} color={palette.mutedForeground}/>
                        <Typography variant="body-sm" className="text-muted-foreground">Add set</Typography>
                    </Pressable>
                </View>
            )}

            <MetricPickerModal
                visible={metricPickerOpen}
                current={metric}
                onSelect={metricField.onChange}
                onClose={() => setMetricPickerOpen(false)}
            />
        </View>
    );
}
