import {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import type {ImagePickerAsset} from 'expo-image-picker';
import {useGetExerciseById, useUpdateExercise, useDeleteThumbnail, getGetExerciseByIdQueryKey} from '@/src/api/generated/exercise/exercise';
import {
    exerciseCreateSchema,
    TITLE_MAX,
    type ExerciseCreateFormValues,
} from '@/src/lib/schemas/exercises/exerciseCreate';
import {ReferenceDataType} from '@/src/constants/referenceDataTypes';
import {assetToBlob} from '@/src/lib/multipart';
import {Input} from '@/src/components/primitives/form/Input';
import {ImagePickerField} from '@/src/components/primitives/form/ImagePickerField';
import {Button} from '@/src/components/primitives/ui/Button';
import {ReferenceDataChips} from '@/src/components/primitives/form/ReferenceDataChips';
import {MuscleRoleSelector} from '@/src/components/exercises/MuscleRoleSelector';
import {EquipmentPickerField} from '@/src/components/equipment/EquipmentPickerField';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Divider} from '@/src/components/primitives/ui/Divider';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';

export default function EditExerciseScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {data: exercise, isLoading} = useGetExerciseById(Number(id));
    const {mutate: updateExercise, isPending} = useUpdateExercise();
    const {mutate: deleteThumbnail, isPending: isDeletingThumbnail} = useDeleteThumbnail();
    const [thumbnail, setThumbnail] = useState<ImagePickerAsset | null>(null);

    const {control, handleSubmit, reset, formState: {errors}} = useForm<ExerciseCreateFormValues>({
        resolver: zodResolver(exerciseCreateSchema),
        defaultValues: {
            title: '',
            movementPatterns: [] as ExerciseCreateFormValues['movementPatterns'],
            muscles: [] as ExerciseCreateFormValues['muscles'],
            requiredEquipmentIds: [],
        },
    });

    useEffect(() => {
        if (!exercise) return;
        reset({
            title: exercise.title ?? '',
            exerciseCategory: exercise.exerciseCategory?.key as ExerciseCreateFormValues['exerciseCategory'] ?? undefined,
            movementPatterns: (exercise.movementPatterns ?? [])
                .map(p => p.key)
                .filter(Boolean) as ExerciseCreateFormValues['movementPatterns'],
            muscles: (exercise.muscles ?? []).map(m => ({
                muscle: m.muscle?.key ?? '',
                type: m.type?.key ?? '',
            })) as unknown as ExerciseCreateFormValues['muscles'],
            requiredEquipmentIds: (exercise.requiredEquipment ?? [])
                .map(e => e.id)
                .filter((id): id is number => id != null),
        });
    }, [exercise]);

    function onSubmit(values: ExerciseCreateFormValues) {
        updateExercise(
            {
                id: Number(id),
                data: {
                    request: {
                        title: values.title,
                        exerciseCategory: values.exerciseCategory,
                        movementPatterns: values.movementPatterns,
                        muscles: values.muscles,
                        requiredEquipmentIds: values.requiredEquipmentIds,
                    },
                    thumbnail: thumbnail ? assetToBlob(thumbnail) : undefined,
                },
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({queryKey: getGetExerciseByIdQueryKey(Number(id))});
                    router.canGoBack() ? router.back() : router.replace({pathname: '/exercise/[id]', params: {id}});
                },
            },
        );
    }

    return (
        <DetailLayout title="Edit exercise">
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                {isLoading ? (
                    <SkeletonGroup gap={20}>
                        <Skeleton height={56} width="100%" rounded="md"/>
                        <Skeleton height={180} width="100%" rounded="md"/>
                        <Skeleton height={56} width="100%" rounded="md"/>
                        <Skeleton height={56} width="100%" rounded="md"/>
                        <Skeleton height={120} width="100%" rounded="md"/>
                    </SkeletonGroup>
                ) : (
                    <View className="gap-5">
                        <Controller
                            control={control}
                            name="title"
                            render={({field: {onChange, onBlur, value}}) => (
                                <Input
                                    label="Title"
                                    placeholder="e.g. Barbell Back Squat"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.title?.message}
                                    maxLength={TITLE_MAX}
                                />
                            )}
                        />

                        <ImagePickerField
                            label="Thumbnail (optional)"
                            value={thumbnail}
                            onChange={setThumbnail}
                            existingUrl={exercise?.thumbnailUrl}
                            onDeleteExisting={() => deleteThumbnail(
                                {id: Number(id)},
                                {onSuccess: () => queryClient.invalidateQueries({queryKey: getGetExerciseByIdQueryKey(Number(id))})},
                            )}
                            isDeletingExisting={isDeletingThumbnail}
                        />

                        <Divider/>

                        <Controller
                            control={control}
                            name="exerciseCategory"
                            render={({field: {value, onChange}}) => (
                                <ReferenceDataChips
                                    label="Category"
                                    type={ReferenceDataType.EXERCISE_CATEGORY}
                                    selected={value ? [value] : []}
                                    onToggle={key => onChange(key === value ? undefined : key)}
                                    error={errors.exerciseCategory ? 'This field is mandatory' : undefined}
                                />
                            )}
                        />

                        <Divider/>

                        <Controller
                            control={control}
                            name="movementPatterns"
                            render={({field: {value, onChange}}) => (
                                <ReferenceDataChips
                                    label="Movement Patterns"
                                    type={ReferenceDataType.MOVEMENT_PATTERNS}
                                    selected={value}
                                    onToggle={key => {
                                        const k = key as ExerciseCreateFormValues['movementPatterns'][number];
                                        const next = value.includes(k)
                                            ? value.filter(p => p !== k)
                                            : [...value, k];
                                        onChange(next);
                                    }}
                                    error={errors.movementPatterns?.message}
                                />
                            )}
                        />

                        <Divider/>

                        <Controller
                            control={control}
                            name="muscles"
                            render={({field: {value, onChange}}) => (
                                <MuscleRoleSelector
                                    value={value}
                                    onChange={onChange}
                                    error={errors.muscles?.message}
                                />
                            )}
                        />

                        <Divider/>

                        <Controller
                            control={control}
                            name="requiredEquipmentIds"
                            render={({field: {value, onChange}}) => (
                                <EquipmentPickerField
                                    label="Required Equipment"
                                    value={value}
                                    onChange={onChange}
                                    error={errors.requiredEquipmentIds?.message}
                                    initialItems={exercise?.requiredEquipment ?? []}
                                />
                            )}
                        />
                    </View>
                )}

                <Button
                    label="Save changes"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                    disabled={isLoading}
                />
            </ScrollView>
        </DetailLayout>
    );
}
