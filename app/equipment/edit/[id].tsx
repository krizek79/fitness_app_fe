import {useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQueryClient} from '@tanstack/react-query';
import type {ImagePickerAsset} from 'expo-image-picker';
import {useGetEquipmentById, useUpdateEquipment, getGetEquipmentByIdQueryKey} from '@/src/api/generated/equipment/equipment';
import {
    equipmentCreateSchema,
    TITLE_MAX,
    type EquipmentCreateFormValues,
} from '@/src/lib/schemas/equipment/equipmentCreate';
import {assetToBlob} from '@/src/lib/multipart';
import {Input} from '@/src/components/primitives/form/Input';
import {ImagePickerField} from '@/src/components/primitives/form/ImagePickerField';
import {Button} from '@/src/components/primitives/ui/Button';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';

export default function EditEquipmentScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const {data: equipment, isLoading} = useGetEquipmentById(Number(id));
    const {mutate: updateEquipment, isPending} = useUpdateEquipment();
    const [thumbnail, setThumbnail] = useState<ImagePickerAsset | null>(null);

    const {control, handleSubmit, reset, formState: {errors}} = useForm<EquipmentCreateFormValues>({
        resolver: zodResolver(equipmentCreateSchema),
        defaultValues: {title: ''},
    });

    useEffect(() => {
        if (equipment) {
            reset({title: equipment.title ?? ''});
        }
    }, [equipment]);

    function onSubmit(values: EquipmentCreateFormValues) {
        updateEquipment(
            {
                id: Number(id),
                data: {
                    request: {title: values.title},
                    thumbnail: thumbnail ? assetToBlob(thumbnail) : undefined,
                },
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({queryKey: getGetEquipmentByIdQueryKey(Number(id))});
                    router.back();
                },
            },
        );
    }

    return (
        <DetailLayout title="Edit equipment">
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                {isLoading ? (
                    <SkeletonGroup gap={20}>
                        <Skeleton height={56} width="100%" rounded="md"/>
                        <Skeleton height={180} width="100%" rounded="md"/>
                    </SkeletonGroup>
                ) : (
                    <View className="gap-5">
                        <Controller
                            control={control}
                            name="title"
                            render={({field: {onChange, onBlur, value}}) => (
                                <Input
                                    label="Title"
                                    placeholder="e.g. Barbell"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.title?.message}
                                    maxLength={TITLE_MAX}
                                />
                            )}
                        />

                        <ImagePickerField
                            label={equipment?.thumbnailUrl ? 'Replace thumbnail (optional)' : 'Thumbnail (optional)'}
                            value={thumbnail}
                            onChange={setThumbnail}
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
