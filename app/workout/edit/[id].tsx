import {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Platform, Pressable, ScrollView, TextInput, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {getGetWorkoutByIdQueryKey, useGetWorkoutById, useUpdateWorkout} from '@/src/api/generated/workout/workout';
import type {WorkoutDetailResponse, WorkoutInputRequest} from '@/src/api/generated/model';
import {useQueryClient} from '@tanstack/react-query';
import {WorkoutExerciseInputRequestWorkoutExerciseMetric} from '@/src/api/generated/model/workoutExerciseInputRequestWorkoutExerciseMetric';
import {WorkoutExerciseSetInputRequestWorkoutExerciseSetType} from '@/src/api/generated/model/workoutExerciseSetInputRequestWorkoutExerciseSetType';
import {WorkoutInputRequestDistanceUnit} from '@/src/api/generated/model/workoutInputRequestDistanceUnit';
import {
    DESCRIPTION_MAX,
    WORKOUT_CREATE_DEFAULTS,
    workoutCreateSchema,
    type WorkoutCreateFormValues,
} from '@/src/lib/schemas/workouts/workoutCreate';
import {toast} from '@/src/lib/toast';
import {Input} from '@/src/components/primitives/form/Input';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {SegmentedControl} from '@/src/components/primitives/ui/SegmentedControl';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {TagInputField} from '@/src/components/workouts/TagInputField';
import {ExercisePickerModal} from '@/src/components/workouts/ExercisePickerModal';
import {ExerciseBuilderItem} from '@/src/components/workouts/ExerciseBuilderItem';
import {SortableList} from '@/src/components/primitives/ui/SortableList';
import {themeColors} from '@/src/constants/colors';
import {cn} from '@/src/lib/utils';

const WEIGHT_UNIT_OPTIONS = [
    {value: 'KG' as const, label: 'KG'},
    {value: 'LB' as const, label: 'LB'},
] as const;

const DISTANCE_UNIT_OPTIONS = [
    {value: 'KM' as const, label: 'KM'},
    {value: 'MILES' as const, label: 'Miles'},
] as const;

const STEP_OPTIONS = [
    {value: '1' as const, label: 'Details'},
    {value: '2' as const, label: 'Exercises'},
] as const;

function workoutToFormValues(workout: WorkoutDetailResponse): WorkoutCreateFormValues {
    return {
        title: workout.title ?? '',
        description: workout.description ?? undefined,
        weightUnit: (workout.weightUnit?.key as 'KG' | 'LB') ?? 'KG',
        distanceUnit: (workout.distanceUnit?.key as 'KM' | 'MILES') ?? 'KM',
        tags: (workout.tags ?? []).map(t => t.name ?? '').filter(Boolean),
        workoutExercises: (workout.workoutExercises ?? []).map(ex => ({
            _backendId: ex.id,
            _stableId: `${ex.id}-${ex.exercise?.id}-${Date.now()}`,
            _exerciseTitle: ex.exercise?.title ?? 'Exercise',
            _exerciseThumbnailUrl: ex.exercise?.thumbnailUrl,
            exerciseId: ex.exercise?.id ?? 0,
            order: ex.order ?? 1,
            workoutExerciseMetric: (ex.workoutExerciseMetric?.key as WorkoutCreateFormValues['workoutExercises'][number]['workoutExerciseMetric']) ?? 'REPS_AND_WEIGHT',
            note: ex.note ?? undefined,
            workoutExerciseSets: (ex.workoutExerciseSets ?? []).map(s => ({
                _backendId: s.id,
                order: s.order ?? 1,
                workoutExerciseSetType: (s.workoutExerciseSetType?.key as WorkoutCreateFormValues['workoutExercises'][number]['workoutExerciseSets'][number]['workoutExerciseSetType']) ?? 'STRAIGHT_SET',
                restDurationSeconds: s.restDurationSeconds ?? undefined,
                note: s.note ?? undefined,
            })),
        })),
    };
}

export default function WorkoutEditScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const workoutId = Number(id);

    const [step, setStep] = useState<'1' | '2'>('1');
    const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
    const [formReady, setFormReady] = useState(false);

    const queryClient = useQueryClient();
    const {data: workout, isLoading} = useGetWorkoutById(workoutId);
    const {mutate: updateWorkout, isPending} = useUpdateWorkout();

    const {control, handleSubmit, reset, formState: {errors}} = useForm<WorkoutCreateFormValues>({
        resolver: zodResolver(workoutCreateSchema),
        defaultValues: WORKOUT_CREATE_DEFAULTS,
        mode: 'onBlur',
    });

    const {fields: exercises, append, remove, replace} = useFieldArray({
        control,
        name: 'workoutExercises',
    });

    const resetDoneRef = useRef(false);
    useEffect(() => {
        if (workout && !resetDoneRef.current) {
            resetDoneRef.current = true;
            reset(workoutToFormValues(workout));
            setFormReady(true);
        }
    }, [workout, reset]);

    function onSubmit(values: WorkoutCreateFormValues) {
        const body: WorkoutInputRequest = {
            title: values.title,
            description: values.description || undefined,
            weightUnit: values.weightUnit,
            distanceUnit: values.distanceUnit as WorkoutInputRequestDistanceUnit,
            isTemplate: workout?.isTemplate ?? false,
            tags: values.tags.map(name => ({name})),
            workoutExercises: values.workoutExercises.map((ex, i) => ({
                id: ex._backendId,
                exerciseId: ex.exerciseId,
                order: i + 1,
                workoutExerciseMetric: ex.workoutExerciseMetric as WorkoutExerciseInputRequestWorkoutExerciseMetric,
                note: ex.note || undefined,
                workoutExerciseSets: ex.workoutExerciseSets.map((s, si) => ({
                    id: s._backendId,
                    order: si + 1,
                    workoutExerciseSetType: s.workoutExerciseSetType as WorkoutExerciseSetInputRequestWorkoutExerciseSetType,
                    restDurationSeconds: s.restDurationSeconds,
                    note: s.note || undefined,
                })),
            })),
        };

        updateWorkout(
            {id: workoutId, data: body},
            {
                onSuccess() {
                    queryClient.invalidateQueries({queryKey: getGetWorkoutByIdQueryKey(workoutId)});
                    toast.success('Workout updated.');
                    router.back();
                },
                onError() {
                    toast.error('Failed to update workout. Please try again.');
                },
            },
        );
    }

    const handleReorder = useCallback((reordered: typeof exercises) => {
        replace(reordered.map((ex, i) => ({...ex, order: i + 1})));
    }, [replace]);

    if (isLoading || !formReady) {
        return (
            <DetailLayout title="Edit Workout">
                <View className="flex-1 items-center justify-center bg-background">
                    <ActivityIndicator color={palette.primary}/>
                </View>
            </DetailLayout>
        );
    }

    return (
        <DetailLayout title={workout?.isTemplate ? 'Edit Template' : 'Edit Workout'}>
            <View className="flex-1 bg-background">
                {/* Step switcher */}
                <View className="px-6 pt-4 pb-2">
                    <SegmentedControl options={STEP_OPTIONS} value={step} onChange={setStep}/>
                </View>

                {/* Step 1 — Details */}
                {step === '1' && (
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{padding: 24, gap: 20, ...webContentStyle}}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Controller
                            control={control}
                            name="title"
                            render={({field: {onChange, onBlur, value}}) => (
                                <Input
                                    label="Title"
                                    placeholder="Workout title"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.title?.message}
                                    maxLength={64}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="description"
                            render={({field: {onChange, onBlur, value}}) => {
                                const count = (value ?? '').length;
                                const hasError = !!errors.description?.message;
                                return (
                                    <View className="gap-1.5">
                                        <Typography variant="body-sm" className="font-medium text-foreground">Description</Typography>
                                        <TextInput
                                            value={value ?? ''}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Optional notes about this workout..."
                                            placeholderTextColor={palette.mutedForeground}
                                            multiline
                                            maxLength={DESCRIPTION_MAX}
                                            className={cn(
                                                'w-full rounded-md border bg-background px-4 py-3 text-base text-foreground',
                                                hasError ? 'border-destructive' : 'border-input',
                                            )}
                                            style={{minHeight: 100, textAlignVertical: 'top'}}
                                        />
                                        <View className="flex-row justify-between">
                                            {hasError
                                                ? <Typography variant="caption" className="text-destructive">{errors.description?.message}</Typography>
                                                : <View/>
                                            }
                                            <Typography variant="caption" className="text-muted-foreground">{count}/{DESCRIPTION_MAX}</Typography>
                                        </View>
                                    </View>
                                );
                            }}
                        />

                        <View className="gap-1.5">
                            <Typography variant="body-sm" className="font-medium text-foreground">Weight unit</Typography>
                            <Controller
                                control={control}
                                name="weightUnit"
                                render={({field: {onChange, value}}) => (
                                    <SegmentedControl options={WEIGHT_UNIT_OPTIONS} value={value} onChange={onChange}/>
                                )}
                            />
                        </View>

                        <View className="gap-1.5">
                            <Typography variant="body-sm" className="font-medium text-foreground">Distance unit</Typography>
                            <Controller
                                control={control}
                                name="distanceUnit"
                                render={({field: {onChange, value}}) => (
                                    <SegmentedControl options={DISTANCE_UNIT_OPTIONS} value={value} onChange={onChange}/>
                                )}
                            />
                        </View>

                        <Controller
                            control={control}
                            name="tags"
                            render={({field: {onChange, value}}) => (
                                <TagInputField value={value} onChange={onChange} label="Tags"/>
                            )}
                        />
                    </ScrollView>
                )}

                {/* Step 2 — Exercises */}
                {step === '2' && (
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{padding: 24, gap: 16, paddingBottom: 24, ...webContentStyle}}
                        keyboardShouldPersistTaps="handled"
                    >
                        {exercises.length === 0 ? (
                            <View className="items-center py-16 gap-3">
                                <Ionicons name="barbell-outline" size={48} color={palette.mutedForeground}/>
                                <Typography variant="muted">No exercises yet. Add one below.</Typography>
                            </View>
                        ) : (
                            <SortableList
                                data={exercises}
                                keyExtractor={item => item._stableId || item.id}
                                gap={12}
                                onReorder={handleReorder}
                                renderItem={({item, dataIndex}) => (
                                    <ExerciseBuilderItem
                                        control={control}
                                        exerciseIndex={dataIndex}
                                        exercise={item}
                                        onRemove={() => remove(dataIndex)}
                                    />
                                )}
                            />
                        )}

                        <Pressable
                            onPress={() => setExercisePickerOpen(true)}
                            className="flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4"
                        >
                            <Ionicons name="add-circle-outline" size={22} color={palette.primary}/>
                            <Typography variant="body" style={{color: palette.primary}}>Add exercise</Typography>
                        </Pressable>
                    </ScrollView>
                )}

                {/* Sticky footer */}
                <View
                    className="bg-background border-t border-border px-6 py-4"
                    style={{paddingBottom: Platform.OS === 'ios' ? 36 : 24}}
                >
                    <Button
                        label={workout?.isTemplate ? 'Save Template' : 'Save Workout'}
                        onPress={handleSubmit(onSubmit, () => {
                            toast.error('Please fix the form errors before submitting.');
                        })}
                        loading={isPending}
                    />
                </View>
            </View>

            <ExercisePickerModal
                visible={exercisePickerOpen}
                onClose={() => setExercisePickerOpen(false)}
                onSelect={exercise => {
                    append({
                        _stableId: `${exercise.id}-${Date.now()}`,
                        _exerciseTitle: exercise.title ?? 'Untitled',
                        _exerciseThumbnailUrl: exercise.thumbnailUrl,
                        exerciseId: exercise.id!,
                        order: exercises.length + 1,
                        workoutExerciseMetric: 'REPS_AND_WEIGHT',
                        note: undefined,
                        workoutExerciseSets: [],
                    });
                }}
            />
        </DetailLayout>
    );
}
