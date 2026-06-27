import {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import type {ImagePickerAsset} from 'expo-image-picker';
import {useCreateExercise} from '@/src/api/generated/exercise/exercise';
import {
    exerciseCreateSchema,
    EXERCISE_CREATE_DEFAULTS,
    TITLE_MAX,
    type ExerciseCreateFormValues,
} from '@/src/lib/schemas/exercises/exerciseCreate';
import {ReferenceDataType} from '@/src/constants/referenceDataTypes';
import {assetToBlob} from '@/src/lib/multipart';
import {Input} from '@/src/components/primitives/form/Input';
import {ImagePickerField} from '@/src/components/primitives/form/ImagePickerField';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {ReferenceDataChips} from '@/src/components/primitives/form/ReferenceDataChips';
import {MuscleRoleSelector} from '@/src/components/exercises/MuscleRoleSelector';
import {EquipmentPickerField} from '@/src/components/equipment/EquipmentPickerField';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Divider} from '@/src/components/primitives/ui/Divider';

export default function CreateExerciseScreen() {
    const router = useRouter();
    const {mutate: createExercise, isPending} = useCreateExercise();
    const [thumbnail, setThumbnail] = useState<ImagePickerAsset | null>(null);

    const {control, handleSubmit, formState: {errors}} = useForm<ExerciseCreateFormValues>({
        resolver: zodResolver(exerciseCreateSchema),
        defaultValues: EXERCISE_CREATE_DEFAULTS,
    });

    function onSubmit(values: ExerciseCreateFormValues) {
        createExercise(
            {
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
                onSuccess(data) {
                    router.replace({pathname: '/exercise/[id]', params: {id: data.id!}});
                },
            },
        );
    }

    return (
        <DetailLayout title="New exercise">
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                <Typography variant="muted">
                    Fill in the details below. You can edit everything after creation.
                </Typography>

                <View className="gap-5">
                    {/* Title */}
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
                    />

                    <Divider/>

                    {/* Category */}
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

                    {/* Movement Patterns */}
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

                    {/* Muscles */}
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

                    {/* Required Equipment */}
                    <Controller
                        control={control}
                        name="requiredEquipmentIds"
                        render={({field: {value, onChange}}) => (
                            <EquipmentPickerField
                                label="Equipment"
                                value={value}
                                onChange={onChange}
                                error={errors.requiredEquipmentIds?.message}
                            />
                        )}
                    />
                </View>

                <Button
                    label="Create Exercise"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                />
            </ScrollView>
        </DetailLayout>
    );
}
