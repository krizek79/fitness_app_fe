import {useCallback, useEffect, useRef, useState} from 'react';
import {Platform, Pressable, ScrollView, TextInput, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useCreateWorkout} from '@/src/api/generated/workout/workout';
import {DraftCreateRequestEntityType} from '@/src/api/generated/model/draftCreateRequestEntityType';
import type {WorkoutInputRequest} from '@/src/api/generated/model';
import {WorkoutExerciseInputRequestWorkoutExerciseMetric} from '@/src/api/generated/model/workoutExerciseInputRequestWorkoutExerciseMetric';
import {WorkoutExerciseSetInputRequestWorkoutExerciseSetType} from '@/src/api/generated/model/workoutExerciseSetInputRequestWorkoutExerciseSetType';
import {
    DESCRIPTION_MAX,
    WORKOUT_CREATE_DEFAULTS,
    workoutCreateSchema,
    type WorkoutCreateFormValues,
} from '@/src/lib/schemas/workouts/workoutCreate';
import {WorkoutInputRequestDistanceUnit} from '@/src/api/generated/model/workoutInputRequestDistanceUnit';
import {useWorkoutDraft} from '@/src/hooks/useWorkoutDraft';
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

type WorkoutType = 'quick' | 'template';

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

export default function WorkoutDraftScreen() {
    const {draftId, type} = useLocalSearchParams<{draftId: string; type: WorkoutType}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const isTemplate = type === 'template';
    const numericDraftId = draftId === 'new' ? null : parseInt(draftId, 10);
    const entityType = isTemplate
        ? DraftCreateRequestEntityType.WORKOUT_TEMPLATE
        : DraftCreateRequestEntityType.WORKOUT;

    const [step, setStep] = useState<'1' | '2'>('1');
    const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(numericDraftId === null);

    const {control, handleSubmit, reset, setValue, watch, getValues, formState: {errors}} = useForm<WorkoutCreateFormValues>({
        resolver: zodResolver(workoutCreateSchema),
        defaultValues: WORKOUT_CREATE_DEFAULTS,
        mode: 'onBlur',
    });

    const {fields: exercises, append, remove, replace} = useFieldArray({
        control,
        name: 'workoutExercises',
    });

    const {save, discard} = useWorkoutDraft({
        draftId: numericDraftId,
        entityType,
        onDraftLoaded: (values) => {
            reset({
                ...WORKOUT_CREATE_DEFAULTS,
                ...values,
                workoutExercises: (values.workoutExercises ?? []).map(ex => {
                    const clean = {...ex};
                    // Strip any RHF internal `id` that may have leaked into a previous draft save
                    delete (clean as Record<string, unknown>)['id'];
                    return {
                        ...clean,
                        _stableId: clean._stableId || `${clean.exerciseId}-${Date.now()}-${Math.random()}`,
                    };
                }),
            });
            setDraftLoaded(true);
        },
    });

    // Auto-save via watch(callback) — does NOT cause re-renders of this component
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => {
        if (!draftLoaded) return;
        const {unsubscribe} = watch(() => {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => {
                const values = getValues();
                save({
                    ...values,
                    workoutExercises: values.workoutExercises.map(({...ex}) => {
                        // Strip RHF's internal `id` (UUID string) — not part of the schema
                        delete (ex as Record<string, unknown>)['id'];
                        return ex;
                    }),
                });
            }, 800);
        });
        return () => {
            unsubscribe();
            clearTimeout(saveTimerRef.current);
        };
    }, [draftLoaded]);

    const {mutate: createWorkout, isPending} = useCreateWorkout();

    function onSubmit(values: WorkoutCreateFormValues) {
        const body: WorkoutInputRequest = {
            title: values.title,
            description: values.description || undefined,
            weightUnit: values.weightUnit,
            distanceUnit: values.distanceUnit as WorkoutInputRequestDistanceUnit,
            isTemplate,
            tags: values.tags.map(name => ({name})),
            workoutExercises: values.workoutExercises.map((ex, i) => ({
                exerciseId: ex.exerciseId,
                order: i + 1,
                workoutExerciseMetric: ex.workoutExerciseMetric as WorkoutExerciseInputRequestWorkoutExerciseMetric,
                note: ex.note || undefined,
                workoutExerciseSets: ex.workoutExerciseSets.map((s, si) => ({
                    order: si + 1,
                    workoutExerciseSetType: s.workoutExerciseSetType as WorkoutExerciseSetInputRequestWorkoutExerciseSetType,
                    restDurationSeconds: s.restDurationSeconds,
                    note: s.note || undefined,
                })),
            })),
        };

        createWorkout(
            {data: body},
            {
                onSuccess(data) {
                    discard();
                    router.replace('/workouts');
                },
                onError() {
                    toast.error('Failed to create workout. Please try again.');
                },
            },
        );
    }

    const handleReorder = useCallback((reordered: typeof exercises) => {
        replace(reordered.map((ex, i) => ({...ex, order: i + 1})));
    }, [replace]);

    const screenTitle = isTemplate ? 'New Template' : 'New Quick Workout';

    return (
        <DetailLayout title={screenTitle}>
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
                                    placeholder={isTemplate ? 'e.g. Push Day A' : 'e.g. Morning Pull Session'}
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.title?.message}
                                    maxLength={64}
                                />
                            )}
                        />

                        {/* Description */}
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

                        {/* Weight unit */}
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

                        {/* Distance unit */}
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

                        {/* Tags */}
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

                {/* Sticky footer — always visible */}
                <View
                    className="bg-background border-t border-border px-6 py-4"
                    style={{paddingBottom: Platform.OS === 'ios' ? 36 : 24}}
                >
                    <Button
                        label={isTemplate ? 'Create Template' : 'Create Workout'}
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
