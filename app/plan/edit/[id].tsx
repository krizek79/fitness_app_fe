import {Pressable, ScrollView, TextInput, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useForm, Controller, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useGetPlanById, useUpdatePlan, getGetPlanByIdQueryKey} from '@/src/api/generated/plan/plan';
import type {ProfileSimpleResponse} from '@/src/api/generated/model';
import {planEditSchema, DESCRIPTION_MAX, WEEKS_MIN, WEEKS_MAX, type PlanEditFormValues} from '@/src/lib/schemas/plans/planEdit';
import {Input} from '@/src/components/primitives/form/Input';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {SearchSelect} from '@/src/components/primitives/form/SearchSelect';
import {TraineePickerModal} from '@/src/components/shared/TraineePickerModal';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {themeColors} from '@/src/constants/colors';
import {cn} from '@/src/lib/utils';

export default function EditPlanScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const [traineePickerOpen, setTraineePickerOpen] = useState(false);
    const [selectedTrainee, setSelectedTrainee] = useState<ProfileSimpleResponse | null>(null);

    const queryClient = useQueryClient();
    const {data: plan, isLoading} = useGetPlanById(Number(id));
    const {mutate: updatePlan, isPending} = useUpdatePlan();

    const {control, handleSubmit, reset, setValue, formState: {errors}} = useForm<PlanEditFormValues>({
        resolver: zodResolver(planEditSchema),
        defaultValues: {title: '', description: '', numberOfWeeks: 1, traineeId: undefined},
    });

    useEffect(() => {
        if (plan) {
            reset({
                title: plan.title ?? '',
                description: plan.description ?? '',
                numberOfWeeks: plan.weeks?.length ?? 1,
                traineeId: plan.trainee?.id ?? undefined,
            });
            setSelectedTrainee(plan.trainee ?? null);
        }
    }, [plan]);

    function onSubmit(values: PlanEditFormValues) {
        const existingWeeks = plan?.weeks ?? [];
        const weeks = Array.from({length: values.numberOfWeeks}, (_, i) => ({
            id: existingWeeks[i]?.id,
            order: i + 1,
        }));

        updatePlan(
            {id: Number(id), data: {title: values.title, description: values.description || undefined, weeks, traineeId: values.traineeId}},
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({queryKey: getGetPlanByIdQueryKey(Number(id))});
                    router.back();
                },
            },
        );
    }

    const watchedValues = useWatch({control});

    const resetButton = (
        <Pressable
            onPress={() => {
                reset({
                    title: plan?.title ?? '',
                    description: plan?.description ?? '',
                    numberOfWeeks: plan?.weeks?.length ?? 1,
                    traineeId: plan?.trainee?.id ?? undefined,
                });
                setSelectedTrainee(plan?.trainee ?? null);
            }}
            accessibilityLabel="Reset changes"
            style={{padding: 8}}
        >
            <Ionicons name="refresh" size={22} color={palette.mutedForeground}/>
        </Pressable>
    );

    return (
        <DetailLayout title="Edit plan" headerRight={resetButton}>
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                {isLoading ? (
                    <SkeletonGroup gap={20}>
                        <Skeleton height={56} width="100%" rounded="md"/>
                        <Skeleton height={100} width="100%" rounded="md"/>
                        <Skeleton height={56} width="100%" rounded="md"/>
                    </SkeletonGroup>
                ) : (
                    <View className="gap-5">
                        <Controller
                            control={control}
                            name="title"
                            render={({field: {onChange, onBlur, value}}) => (
                                <Input
                                    label="Title"
                                    placeholder="e.g. 12-Week Strength Program"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.title?.message}
                                    maxLength={255}
                                />
                            )}
                        />

                        <SearchSelect<ProfileSimpleResponse>
                            label="Assigned to (optional)"
                            placeholder="Search trainee..."
                            value={selectedTrainee ?? undefined}
                            getLabel={t => t.name ?? ''}
                            onSelect={() => {}}
                            onPress={() => setTraineePickerOpen(true)}
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
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            placeholder="Optional — describe the goal or structure of this plan"
                                            placeholderTextColor="rgb(var(--muted-foreground))"
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

                        <Controller
                            control={control}
                            name="numberOfWeeks"
                            render={({field: {onChange, value}}) => (
                                <View className="gap-1.5">
                                    <Typography variant="body-sm" className="font-medium text-foreground">Number of weeks</Typography>
                                    <View className="flex-row items-center gap-3">
                                        <Pressable
                                            onPress={() => onChange(Math.max(WEEKS_MIN, value - 1))}
                                            disabled={value <= WEEKS_MIN}
                                            className={cn(
                                                'w-11 h-11 rounded-lg border border-input bg-background items-center justify-center',
                                                value <= WEEKS_MIN && 'opacity-30',
                                            )}
                                        >
                                            <Ionicons name="remove" size={20} color={palette.mutedForeground}/>
                                        </Pressable>

                                        <View className="flex-1 h-11 rounded-md border border-input bg-background items-center justify-center">
                                            <Typography variant="body" className="font-semibold text-foreground">
                                                {value} {value === 1 ? 'week' : 'weeks'}
                                            </Typography>
                                        </View>

                                        <Pressable
                                            onPress={() => onChange(Math.min(WEEKS_MAX, value + 1))}
                                            disabled={value >= WEEKS_MAX}
                                            className={cn(
                                                'w-11 h-11 rounded-lg border border-input bg-background items-center justify-center',
                                                value >= WEEKS_MAX && 'opacity-30',
                                            )}
                                        >
                                            <Ionicons name="add" size={20} color={palette.mutedForeground}/>
                                        </Pressable>
                                    </View>
                                    {errors.numberOfWeeks && (
                                        <Typography variant="caption" className="text-destructive">{errors.numberOfWeeks.message}</Typography>
                                    )}
                                </View>
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

            <TraineePickerModal
                visible={traineePickerOpen}
                onClose={() => setTraineePickerOpen(false)}
                onSelect={trainee => {
                    setSelectedTrainee(trainee);
                    setValue('traineeId', trainee?.id ?? undefined);
                }}
            />
        </DetailLayout>
    );
}
