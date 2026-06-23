import {useCallback} from 'react';
import {View} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useFilterWorkoutSessions} from '@/src/api/generated/workout-session/workout-session';
import type {WorkoutSessionSimpleResponse} from '@/src/api/generated/model';
import {FilteredList} from '@/src/components/primitives/layout/FilteredList';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Card} from '@/src/components/primitives/ui/Card';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {DetailLayout} from '@/src/components/primitives/layout/DetailLayout';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';

const PAGE_SIZE = 20;

type SessionStatus = WorkoutSessionSimpleResponse['status'];

function statusVariant(status: SessionStatus): 'success' | 'warning' | 'muted' | 'default' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'IN_PROGRESS') return 'warning';
    return 'muted';
}

function statusLabel(status: SessionStatus): string {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'IN_PROGRESS') return 'In progress';
    if (status === 'SKIPPED') return 'Skipped';
    return 'Not started';
}

function formatDate(iso?: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
}

function formatDuration(startedAt?: string, finishedAt?: string): string | null {
    if (!startedAt || !finishedAt) return null;
    const mins = Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function SessionCard({session, onPress}: {session: WorkoutSessionSimpleResponse; onPress: () => void}) {
    const duration = formatDuration(session.startedAt, session.finishedAt);

    return (
        <Card padding="md" className="gap-2" onPress={onPress}>
            <View className="flex-row items-center justify-between">
                <Typography variant="body" className="text-foreground font-semibold flex-1 mr-2">
                    {session.workout?.title ?? 'Untitled workout'}
                </Typography>
                <Badge label={statusLabel(session.status)} variant={statusVariant(session.status)}/>
            </View>
            <View className="flex-row items-center gap-3">
                {session.startedAt && (
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="calendar-outline" size={12} color="#6b7280"/>
                        <Typography variant="caption" className="text-muted-foreground">
                            {formatDate(session.startedAt)}
                        </Typography>
                    </View>
                )}
                {duration && (
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={12} color="#6b7280"/>
                        <Typography variant="caption" className="text-muted-foreground">{duration}</Typography>
                    </View>
                )}
            </View>
        </Card>
    );
}

function HistorySkeleton() {
    return (
        <SkeletonGroup gap={12}>
            {Array.from({length: 6}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <View className="flex-row justify-between">
                        <Skeleton height={18} width="55%" rounded="md"/>
                        <Skeleton height={22} width={80} rounded="full"/>
                    </View>
                    <Skeleton height={13} width="35%" rounded="md"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

export default function HistoryScreen() {
    const router = useRouter();
    const {mutate, isPending} = useFilterWorkoutSessions();

    const {items, isRefreshing, refresh, loadNextPage, isInitialLoad} =
        usePaginatedMutation<WorkoutSessionSimpleResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                mutate(
                    {
                        data: {
                            page,
                            size: PAGE_SIZE,
                            sortBy: 'startedAt',
                            sortDirection: 'DESC',
                        },
                    },
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [mutate]),
            isPending,
            filterDeps: [],
        });

    return (
        <DetailLayout title="History">
            <FilteredList<WorkoutSessionSimpleResponse>
                data={items}
                renderItem={({item}) => (
                    <View className="px-6">
                        <SessionCard
                            session={item}
                            onPress={() => router.push({
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                pathname: '/workout-session/[id]' as any,
                                params: {id: item.id!},
                            })}
                        />
                    </View>
                )}
                keyExtractor={item => String(item.id)}
                filterBar={<View className="pt-6"/>}
                skeleton={<View className="px-6"><HistorySkeleton/></View>}
                emptyIcon={<Ionicons name="time-outline" size={48} color="#9ca3af"/>}
                emptyTitle="No sessions yet"
                emptyDescription="Start a workout to track your progress here."
                isInitialLoad={isInitialLoad}
                isPending={isPending}
                isRefreshing={isRefreshing}
                onRefresh={refresh}
                onEndReached={loadNextPage}
            />
        </DetailLayout>
    );
}
