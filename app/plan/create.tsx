import {Pressable, ScrollView, TextInput, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useForm, Controller, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useEffect} from 'react';
import {useCreatePlan} from '@/src/api/generated/plan/plan';
import {planCreateSchema, PLAN_CREATE_DEFAULTS, DESCRIPTION_MAX, WEEKS_MIN, WEEKS_MAX, type PlanCreateFormValues} from '@/src/lib/schemas/plans/planCreate';
import {usePlanDraft} from '@/src/hooks/usePlanDraft';
import {useDebounce} from '@/src/hooks/useDebounce';
import {Input} from '@/src/components/primitives/form/Input';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {SearchSelect} from '@/src/components/primitives/form/SearchSelect';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {themeColors} from '@/src/constants/colors';
import {cn} from '@/src/lib/utils';

export default function CreatePlanScreen() {
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const {mutate: createPlan, isPending} = useCreatePlan();

    const {control, handleSubmit, reset, formState: {errors}} = useForm<PlanCreateFormValues>({
        resolver: zodResolver(planCreateSchema),
        defaultValues: PLAN_CREATE_DEFAULTS,
    });

    const {save, discard} = usePlanDraft({
        onDraftLoaded: (values) => reset({...PLAN_CREATE_DEFAULTS, ...values}),
    });

    function handleReset() {
        discard();
        reset(PLAN_CREATE_DEFAULTS);
    }

    const watchedValues = useWatch({control});
    const debouncedValues = useDebounce(watchedValues, 800);

    useEffect(() => {
        if (debouncedValues.title || debouncedValues.description) {
            save(debouncedValues as PlanCreateFormValues);
        }
    }, [debouncedValues]);

    function onSubmit(values: PlanCreateFormValues) {
        const weeks = Array.from({length: values.numberOfWeeks}, (_, i) => ({order: i + 1}));
        createPlan(
            {data: {title: values.title, description: values.description || undefined, weeks}},
            {
                onSuccess(data) {
                    discard();
                    router.replace({pathname: '/plan/[id]', params: {id: data.id!}});
                },
            },
        );
    }

    const resetButton = (
        <Pressable onPress={handleReset} accessibilityLabel="Reset form" style={{padding: 8}}>
            <Ionicons name="refresh" size={22} color={palette.mutedForeground}/>
        </Pressable>
    );

    return (
        <DetailLayout title="New training plan" headerRight={resetButton}>
            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{padding: 24, gap: 28, ...webContentStyle}}
                keyboardShouldPersistTaps="handled"
            >
                <Typography variant="muted">Fill in the details to get started. You can add workouts after creation.</Typography>

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

                    <SearchSelect
                        label="Assigned to (optional)"
                        placeholder="Search trainee..."
                        items={[]}
                        getLabel={() => ''}
                        onSelect={() => {}}
                        disabled
                    />

                    {/* Description with character counter */}
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

                    {/* Weeks stepper */}
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

                <Button
                    label="Create Plan"
                    onPress={handleSubmit(onSubmit)}
                    loading={isPending}
                />
            </ScrollView>
        </DetailLayout>
    );
}
