import {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import type {ImagePickerAsset} from 'expo-image-picker';
import {useCreateEquipment} from '@/src/api/generated/equipment/equipment';
import {
    equipmentCreateSchema,
    EQUIPMENT_CREATE_DEFAULTS,
    TITLE_MAX,
    type EquipmentCreateFormValues,
} from '@/src/lib/schemas/equipment/equipmentCreate';
import {assetToBlob} from '@/src/lib/multipart';
import {Input} from '@/src/components/primitives/form/Input';
import {ImagePickerField} from '@/src/components/primitives/form/ImagePickerField';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';

export default function CreateEquipmentScreen() {
    const router = useRouter();
    const {mutate: createEquipment, isPending} = useCreateEquipment();
    const [thumbnail, setThumbnail] = useState<ImagePickerAsset | null>(null);

    const {control, handleSubmit, formState: {errors}} = useForm<EquipmentCreateFormValues>({
        resolver: zodResolver(equipmentCreateSchema),
        defaultValues: EQUIPMENT_CREATE_DEFAULTS,
    });

    function onSubmit(values: EquipmentCreateFormValues) {
        createEquipment(
            {
                data: {
                    request: {title: values.title},
                    thumbnail: thumbnail ? assetToBlob(thumbnail) : undefined,
                },
            },
            {
                onSuccess(data) {
                    router.replace({pathname: '/equipment/[id]', params: {id: data.id!}});
                },
            },
        );
    }

    return (
        <DetailLayout title="New equipment">
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                <Typography variant="muted">
                    Fill in the details below. You can edit everything after creation.
                </Typography>

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
                        label="Thumbnail (optional)"
                        value={thumbnail}
                        onChange={setThumbnail}
                    />
                </View>

                <Button
                    label="Create Equipment"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                />
            </ScrollView>
        </DetailLayout>
    );
}
