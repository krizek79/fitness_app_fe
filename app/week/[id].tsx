import {Alert, Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useGetWeekById} from '@/src/api/generated/week/week';
import {useGetPlanById, useUpdatePlan} from '@/src/api/generated/plan/plan';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Card} from '@/src/components/primitives/ui/Card';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import type {WeekWorkoutResponse} from '@/src/api/generated/model';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_LABELS: Record<string, string> = {
    MONDAY: 'Mon',
    TUESDAY: 'Tue',
    WEDNESDAY: 'Wed',
    THURSDAY: 'Thu',
    FRIDAY: 'Fri',
    SATURDAY: 'Sat',
    SUNDAY: 'Sun',
};

function groupByDay(weekWorkouts: WeekWorkoutResponse[]) {
    const map = new Map<string, WeekWorkoutResponse[]>();
    for (const ww of weekWorkouts) {
        const day = ww.dayOfWeek ?? 'UNSCHEDULED';
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(ww);
    }
    for (const [, workouts] of map) {
        workouts.sort((a, b) => (a.orderInTheDay ?? 0) - (b.orderInTheDay ?? 0));
    }
    return map;
}

function WeekDetailSkeleton() {
    return (
        <SkeletonGroup gap={16}>
            <Skeleton height={72} width="100%" rounded="xl"/>
            <Skeleton height={20} width="40%" rounded="md"/>
            <View className="gap-1.5">
                {Array.from({length: 7}).map((_, i) => (
                    <Skeleton key={i} height={52} width="100%" rounded="lg"/>
                ))}
            </View>
        </SkeletonGroup>
    );
}

export default function WeekDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: week, isLoading, refetch, isRefetching} = useGetWeekById(Number(id));
    const {data: plan} = useGetPlanById(week?.planId!, {query: {enabled: !!week?.planId}});
    const {mutate: updatePlan, isPending: isDeleting} = useUpdatePlan();

    const weekWorkouts = week?.weekWorkouts ?? [];
    const byDay = groupByDay(weekWorkouts);

    const completedCount = weekWorkouts.filter(ww => ww.status === 'COMPLETED').length;
    const totalCount = weekWorkouts.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const unscheduled = byDay.get('UNSCHEDULED') ?? [];

    function handleDelete() {
        if (!plan || !week) return;

        const remainingWeeks = (plan.weeks ?? [])
            .filter(w => w.id !== week.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((w, i) => ({id: w.id, order: i + 1}));

        const perform = () => updatePlan(
            {
                id: plan.id!,
                data: {
                    title: plan.title!,
                    description: plan.description ?? undefined,
                    traineeId: plan.trainee?.id ?? undefined,
                    weeks: remainingWeeks,
                },
            },
            {onSuccess: () => router.replace({pathname: '/plan/[id]', params: {id: plan.id!}})},
        );

        const message = `Delete Week ${week.order}? This cannot be undone.`;
        if (Platform.OS === 'web') {
            if (window.confirm(message)) perform();
            return;
        }
        Alert.alert('Delete week', message, [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Delete', style: 'destructive', onPress: perform},
        ]);
    }

    const headerRight = !isLoading && (
        <Pressable
            onPress={handleDelete}
            disabled={isDeleting || !plan}
            accessibilityLabel="Delete week"
            style={{padding: 8, opacity: isDeleting || !plan ? 0.4 : 1}}
        >
            <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
        </Pressable>
    );

    return (
        <DetailLayout
            title={isLoading ? 'Loading…' : `Week ${week?.order ?? id}`}
            headerRight={headerRight || undefined}
        >
            <ScrollView
                contentContainerStyle={{padding: 24, gap: 16, ...webContentStyle}}
                refreshControl={Platform.OS !== 'web' ? (
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary}/>
                ) : undefined}
            >
                {isLoading ? (
                    <WeekDetailSkeleton/>
                ) : (
                    <>
                        {/* Progress summary — only when workouts exist */}
                        {totalCount > 0 && (
                            <View className="gap-3 p-4 rounded-xl bg-card border border-border">
                                <View className="flex-row items-center justify-between">
                                    <Typography variant="body-sm" className="text-muted-foreground">
                                        Progress
                                    </Typography>
                                    <View className="flex-row items-center gap-2">
                                        {week?.completed && <Badge label="Completed" variant="success"/>}
                                        {!week?.completed && completedCount > 0 && <Badge label="In progress" variant="warning"/>}
                                        {!week?.completed && completedCount === 0 && <Badge label="Not started" variant="muted"/>}
                                        <Typography variant="caption" className="text-foreground font-medium">
                                            {completedCount} / {totalCount}
                                        </Typography>
                                    </View>
                                </View>
                                <View className="h-2 rounded-full bg-muted overflow-hidden">
                                    <View
                                        className={`h-full rounded-full ${week?.completed ? 'bg-success' : 'bg-primary'}`}
                                        style={{width: `${progressPercent}%`}}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Note */}
                        {week?.note && (
                            <View className="gap-1">
                                <Heading level="h5">Note</Heading>
                                <Typography variant="body-sm" className="text-muted-foreground">
                                    {week.note}
                                </Typography>
                            </View>
                        )}

                        {/* 7-day calendar */}
                        <View className="gap-3">
                            <Heading level="h5">Schedule</Heading>
                            <View className="gap-1.5">
                                {DAY_ORDER.map(day => {
                                    const dayWorkouts = byDay.get(day) ?? [];
                                    const hasWorkouts = dayWorkouts.length > 0;
                                    const allDone = hasWorkouts && dayWorkouts.every(ww => ww.status === 'COMPLETED');

                                    return (
                                        <View
                                            key={day}
                                            className={`flex-row items-center px-4 py-3 rounded-lg border gap-3 ${
                                                allDone
                                                    ? 'bg-success/10 border-success/30'
                                                    : hasWorkouts
                                                        ? 'bg-primary/10 border-primary/30'
                                                        : 'bg-card border-border'
                                            }`}
                                        >
                                            <Typography
                                                variant="body-sm"
                                                className={`font-semibold w-10 ${hasWorkouts ? 'text-foreground' : 'text-muted-foreground'}`}
                                            >
                                                {DAY_LABELS[day]}
                                            </Typography>

                                            <View className="w-px self-stretch bg-border"/>

                                            <View className="flex-1">
                                                {hasWorkouts ? (
                                                    <View className="flex-row flex-wrap gap-1">
                                                        {dayWorkouts.map(ww => (
                                                            <Badge
                                                                key={ww.id}
                                                                label={ww.workout?.title ?? 'Untitled'}
                                                                variant={ww.status === 'COMPLETED' ? 'success' : ww.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                                                            />
                                                        ))}
                                                    </View>
                                                ) : (
                                                    <Typography variant="caption" className="text-muted-foreground">
                                                        Rest day
                                                    </Typography>
                                                )}
                                            </View>

                                            {allDone && (
                                                <Ionicons name="checkmark-circle" size={18} color="#22c55e"/>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Workouts list per day */}
                        {DAY_ORDER.filter(d => byDay.has(d)).map(day => (
                            <View key={day} className="gap-2">
                                <Typography variant="caption" className="text-muted-foreground uppercase tracking-wider font-semibold">
                                    {DAY_LABELS[day]}
                                </Typography>
                                {byDay.get(day)!.map(ww => (
                                    <Card
                                        key={ww.id}
                                        padding="md"
                                        className="gap-1"
                                        onPress={ww.workout?.id != null
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            ? () => router.push({pathname: '/workout/[id]' as any, params: {id: ww.workout!.id!, weekWorkoutId: ww.id!}})
                                            : undefined}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <Typography variant="body-sm" className="text-foreground font-medium flex-1 mr-2">
                                                {ww.workout?.title ?? 'Untitled workout'}
                                            </Typography>
                                            {ww.status === 'COMPLETED' && <Badge label="Done" variant="success"/>}
                                        </View>
                                        {ww.workout?.tags && ww.workout.tags.length > 0 && (
                                            <View className="flex-row flex-wrap gap-1 mt-1">
                                                {ww.workout.tags.map(tag => (
                                                    <Badge key={tag.id} label={tag.name ?? ''} variant="muted"/>
                                                ))}
                                            </View>
                                        )}
                                    </Card>
                                ))}
                            </View>
                        ))}

                        {/* Unscheduled workouts */}
                        {unscheduled.length > 0 && (
                            <View className="gap-2">
                                <Typography variant="caption" className="text-muted-foreground uppercase tracking-wider font-semibold">
                                    Unscheduled
                                </Typography>
                                {unscheduled.map(ww => (
                                    <Card
                                        key={ww.id}
                                        padding="md"
                                        className="gap-1"
                                        onPress={ww.workout?.id != null
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            ? () => router.push({pathname: '/workout/[id]' as any, params: {id: ww.workout!.id!, weekWorkoutId: ww.id!}})
                                            : undefined}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <Typography variant="body-sm" className="text-foreground font-medium flex-1 mr-2">
                                                {ww.workout?.title ?? 'Untitled workout'}
                                            </Typography>
                                            {ww.status === 'COMPLETED' && <Badge label="Done" variant="success"/>}
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </DetailLayout>
    );
}
