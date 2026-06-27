import {useCallback, useRef} from 'react';
import {Alert, Image, Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router';
import {useDeleteWorkout, useGetWorkoutById} from '@/src/api/generated/workout/workout';
import {useCreateWorkoutSession, useFilterWorkoutSessions} from '@/src/api/generated/workout-session/workout-session';
import type {WorkoutExerciseResponse, WorkoutExerciseSetResponse, WorkoutSessionInputRequest, WorkoutSessionSimpleResponse} from '@/src/api/generated/model';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {WorkoutSessionInputRequestStatus} from '@/src/api/generated/model/workoutSessionInputRequestStatus';
import {WorkoutExerciseSetResultInputRequestWorkoutExerciseSetType} from '@/src/api/generated/model/workoutExerciseSetResultInputRequestWorkoutExerciseSetType';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {Button} from '@/src/components/primitives/ui/Button';
import {Card} from '@/src/components/primitives/ui/Card';
import {SET_TYPE_LABELS, METRIC_LABELS} from '@/src/lib/schemas/workouts/workoutCreate';
import {toast} from '@/src/lib/toast';

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

function sessionStatusVariant(status?: WorkoutSessionSimpleResponse['status']): 'success' | 'warning' | 'muted' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'IN_PROGRESS') return 'warning';
    return 'muted';
}

function sessionStatusLabel(status?: WorkoutSessionSimpleResponse['status']): string {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'IN_PROGRESS') return 'In progress';
    if (status === 'SKIPPED') return 'Skipped';
    return 'Not started';
}

function goalSummary(set: WorkoutExerciseSetResponse, metric: string): string {
    const parts: string[] = [];
    if ((metric === 'REPS' || metric === 'REPS_AND_WEIGHT') && set.goalRepetitions != null) {
        parts.push(`${set.goalRepetitions} reps`);
    }
    if ((metric === 'REPS_AND_WEIGHT' || metric === 'TIME_AND_WEIGHT') && set.goalWeight != null) {
        parts.push(`${set.goalWeight} kg`);
    }
    if ((metric === 'TIME' || metric === 'TIME_AND_WEIGHT' || metric === 'DISTANCE_AND_TIME') && set.goalTimeSeconds != null) {
        const m = Math.floor(set.goalTimeSeconds / 60);
        const s = set.goalTimeSeconds % 60;
        parts.push(m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m} min`) : `${s}s`);
    }
    if ((metric === 'DISTANCE' || metric === 'DISTANCE_AND_TIME') && set.goalDistanceMeters != null) {
        parts.push(`${set.goalDistanceMeters}m`);
    }
    if (set.restDurationSeconds != null) {
        const m = Math.floor(set.restDurationSeconds / 60);
        const s = set.restDurationSeconds % 60;
        parts.push(`${m > 0 ? (s > 0 ? `${m}m ${s}s` : `${m} min`) : `${s}s`} rest`);
    }
    return parts.join(' · ');
}

function estimateDurationMins(exercises: WorkoutExerciseResponse[]): number {
    let secs = 0;
    for (const ex of exercises) {
        for (const s of ex.workoutExerciseSets ?? []) {
            secs += (s.goalTimeSeconds ?? 45);
            secs += (s.restDurationSeconds ?? 90);
        }
    }
    return Math.round(secs / 60);
}

const THUMB_SIZE = 40;

function ExerciseThumbnail({url}: {url?: string}) {
    return (
        <View className="bg-muted items-center justify-center overflow-hidden" style={{width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8}}>
            {url ? (
                Platform.OS === 'web' ? (
                    // @ts-ignore
                    <img src={url} style={{width: THUMB_SIZE, height: THUMB_SIZE, objectFit: 'cover'}} alt=""/>
                ) : (
                    <Image source={{uri: url}} style={{width: THUMB_SIZE, height: THUMB_SIZE}} resizeMode="cover"/>
                )
            ) : (
                <Ionicons name="barbell-outline" size={20} color="#9ca3af"/>
            )}
        </View>
    );
}

function ExerciseCard({exercise}: {exercise: WorkoutExerciseResponse}) {
    const metric = exercise.workoutExerciseMetric?.key ?? 'REPS';
    const metricLabel = METRIC_LABELS[metric as keyof typeof METRIC_LABELS] ?? metric;
    const thumbnailUrl = exercise.exercise?.thumbnailUrl;
    const sets = exercise.workoutExerciseSets ?? [];

    return (
        <Card padding="md" className="gap-3">
            {/* Header row: thumbnail + name + metric badge */}
            <View className="flex-row items-center gap-3">
                <ExerciseThumbnail url={thumbnailUrl}/>
                <View className="flex-1">
                    <Typography variant="body" className="font-semibold text-foreground">
                        {exercise.exercise?.title ?? 'Exercise'}
                    </Typography>
                    <Badge label={metricLabel} variant="muted"/>
                </View>
            </View>

            {/* Sets */}
            {sets.length > 0 && (
                <View style={{gap: 4, paddingLeft: THUMB_SIZE + 12}}>
                    {sets.map((s, i) => {
                        const typeKey = s.workoutExerciseSetType?.key as keyof typeof SET_TYPE_LABELS | undefined;
                        const typeLabel = (typeKey && SET_TYPE_LABELS[typeKey]) ?? s.workoutExerciseSetType?.value ?? '';
                        const summary = goalSummary(s, metric);
                        return (
                            <View key={s.id ?? i} className="flex-row items-center gap-2">
                                <View className="w-4 h-4 rounded-full bg-muted items-center justify-center" style={{flexShrink: 0}}>
                                    <Typography variant="caption" className="font-bold text-muted-foreground" style={{fontSize: 9}}>
                                        {i + 1}
                                    </Typography>
                                </View>
                                <View className="rounded-full bg-muted px-2" style={{paddingVertical: 1}}>
                                    <Typography variant="caption" className="text-foreground" style={{fontSize: 11}}>{typeLabel}</Typography>
                                </View>
                                {summary ? (
                                    <Typography variant="caption" className="text-muted-foreground flex-1" style={{fontSize: 11}}>
                                        {summary}
                                    </Typography>
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            )}

            {exercise.note && (
                <Typography variant="caption" className="text-muted-foreground italic" style={{paddingLeft: THUMB_SIZE + 12}}>
                    {exercise.note}
                </Typography>
            )}
        </Card>
    );
}

function WorkoutDetailSkeleton() {
    return (
        <SkeletonGroup gap={16}>
            <Skeleton height={100} width="100%" rounded="lg"/>
            {Array.from({length: 3}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <View className="flex-row items-center gap-3">
                        <Skeleton height={40} width={40} rounded="md"/>
                        <View className="flex-1 gap-2">
                            <Skeleton height={14} width="55%" rounded="md"/>
                            <Skeleton height={11} width="30%" rounded="md"/>
                        </View>
                    </View>
                    <Skeleton height={11} width="80%" rounded="md"/>
                    <Skeleton height={11} width="65%" rounded="md"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

export default function WorkoutDetailScreen() {
    const {id, weekWorkoutId} = useLocalSearchParams<{id: string; weekWorkoutId?: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: workout, isLoading, refetch, isRefetching} = useGetWorkoutById(Number(id));
    const {mutate: createSession, isPending: isStarting} = useCreateWorkoutSession();
    const {mutate: deleteWorkout, isPending: isDeleting} = useDeleteWorkout();
    const {mutate: filterSessions, isPending: isSessionsPending} = useFilterWorkoutSessions();

    const workoutId = Number(id);

    const {items: sessions, isInitialLoad: isSessionsLoading, isRefreshing: isSessionsRefreshing, refresh: refreshSessions, loadNextPage} =
        usePaginatedMutation<WorkoutSessionSimpleResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                filterSessions(
                    {data: {page, size: 20, sortBy: 'startedAt', sortDirection: 'DESC', workoutId}},
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [filterSessions, workoutId]),
            isPending: isSessionsPending,
            filterDeps: [workoutId],
        });

    // Re-fetch sessions whenever this screen regains focus (e.g. returning from a completed session).
    // Skip the very first focus to avoid a double-fetch on initial mount (usePaginatedMutation already fetches then).
    const focusedOnce = useRef(false);
    useFocusEffect(useCallback(() => {
        if (!focusedOnce.current) { focusedOnce.current = true; return; }
        refreshSessions();
    }, [refreshSessions]));

    function handleRefresh() {
        refetch();
        refreshSessions();
    }

    function handleStart() {
        if (!workout) return;

        const body: WorkoutSessionInputRequest = {
            workoutId: workout.id!,
            weekWorkoutId: weekWorkoutId ? Number(weekWorkoutId) : undefined,
            status: WorkoutSessionInputRequestStatus.IN_PROGRESS,
            startedAt: new Date().toISOString(),
            workoutExerciseSessions: (workout.workoutExercises ?? []).map(ex => ({
                workoutExerciseId: ex.id!,
                order: ex.order!,
                note: ex.note,
                workoutExerciseSetResults: (ex.workoutExerciseSets ?? []).map(s => ({
                    workoutExerciseSetId: s.id,
                    order: s.order!,
                    workoutExerciseSetType: (s.workoutExerciseSetType?.key ?? 'STRAIGHT_SET') as WorkoutExerciseSetResultInputRequestWorkoutExerciseSetType,
                    repetitions: s.goalRepetitions,
                    weight: s.goalWeight,
                    timeSeconds: s.goalTimeSeconds,
                    distanceMeters: s.goalDistanceMeters,
                    restDurationSeconds: s.restDurationSeconds,
                    completed: false,
                    note: s.note,
                })),
            })),
        };

        createSession(
            {data: body},
            {
                onSuccess(session) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    router.push({pathname: '/workout-session/[id]' as any, params: {id: session.id!}});
                },
                onError() {
                    toast.error('Failed to start workout. Please try again.');
                },
            },
        );
    }

    function confirmStart() {
        if (Platform.OS === 'web') {
            handleStart();
            return;
        }
        Alert.alert(
            'Start workout',
            `Start "${workout?.title ?? 'this workout'}"?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Start', onPress: handleStart},
            ],
        );
    }

    function handleDelete() {
        const message = `Are you sure you want to delete "${workout?.title ?? 'this workout'}"? This cannot be undone.`;
        if (Platform.OS === 'web') {
            if (window.confirm(message)) {
                deleteWorkout({id: workoutId}, {onSuccess: () => router.back()});
            }
            return;
        }
        Alert.alert('Delete workout', message, [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteWorkout({id: workoutId}, {onSuccess: () => router.back()}),
            },
        ]);
    }

    const headerRight = !isLoading ? (
        <View className="flex-row items-center gap-1">
            <Pressable
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onPress={() => router.push({pathname: '/workout/edit/[id]' as any, params: {id}})}
                accessibilityLabel="Edit workout"
                style={{padding: 8}}
            >
                <Ionicons name="pencil-outline" size={20} color={palette.foreground}/>
            </Pressable>
            <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityLabel="Delete workout"
                style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
            >
                <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
            </Pressable>
        </View>
    ) : undefined;

    const inProgressSession = sessions.find(s => s.status === 'IN_PROGRESS');

    const tags = workout?.tags ?? [];
    const exercises = workout?.workoutExercises ?? [];

    return (
        <DetailLayout title={isLoading ? 'Loading…' : (workout?.title ?? 'Workout')} headerRight={headerRight}>
            <View className="flex-1 bg-background">
                <ScrollView
                    contentContainerStyle={{padding: 24, gap: 16, paddingBottom: 100, ...webContentStyle}}
                    refreshControl={Platform.OS !== 'web' ? (
                        <RefreshControl refreshing={isRefetching || isSessionsRefreshing} onRefresh={handleRefresh}/>
                    ) : undefined}
                    onScroll={({nativeEvent}) => {
                        const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
                        if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200) {
                            loadNextPage();
                        }
                    }}
                    scrollEventThrottle={200}
                >
                    {isLoading ? (
                        <WorkoutDetailSkeleton/>
                    ) : (
                        <>
                            {/* Hero card */}
                            <Card padding="md" className="gap-4">
                                {/* Tags + author/trainee */}
                                <View className="gap-3">
                                    {tags.length > 0 && (
                                        <View className="flex-row flex-wrap gap-2">
                                            {tags.map(t => <Badge key={t.id} label={t.name ?? ''} variant="muted"/>)}
                                        </View>
                                    )}
                                    {(workout?.author?.name || workout?.trainee?.name) && (
                                        <View className="flex-row flex-wrap gap-4">
                                            {workout?.author?.name && (
                                                <View className="flex-row items-center gap-1">
                                                    <Typography variant="caption" className="text-muted-foreground">By</Typography>
                                                    <Typography variant="caption" className="text-foreground">{workout.author.name}</Typography>
                                                </View>
                                            )}
                                            {workout?.trainee?.name && (
                                                <View className="flex-row items-center gap-1">
                                                    <Typography variant="caption" className="text-muted-foreground">For</Typography>
                                                    <Typography variant="caption" className="text-foreground">{workout.trainee.name}</Typography>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                    {workout?.description && (
                                        <Typography variant="body-sm" className="text-muted-foreground">
                                            {workout.description}
                                        </Typography>
                                    )}
                                </View>

                                {/* Stat row */}
                                <View className="flex-row gap-3">
                                    <View className="flex-1 bg-muted rounded-lg items-center py-2">
                                        <Typography variant="body" className="font-semibold text-foreground">{exercises.length}</Typography>
                                        <Typography variant="caption" className="text-muted-foreground" style={{fontSize: 10}}>exercises</Typography>
                                    </View>
                                    <View className="flex-1 bg-muted rounded-lg items-center py-2">
                                        <Typography variant="body" className="font-semibold text-foreground">
                                            {exercises.reduce((acc, ex) => acc + (ex.workoutExerciseSets?.length ?? 0), 0)}
                                        </Typography>
                                        <Typography variant="caption" className="text-muted-foreground" style={{fontSize: 10}}>sets</Typography>
                                    </View>
                                    <View className="flex-1 bg-muted rounded-lg items-center py-2">
                                        <Typography variant="body" className="font-semibold text-foreground">~{estimateDurationMins(exercises)}m</Typography>
                                        <Typography variant="caption" className="text-muted-foreground" style={{fontSize: 10}}>est. time</Typography>
                                    </View>
                                </View>
                            </Card>

                            {/* Exercises */}
                            {exercises.length > 0 && (
                                <View className="gap-3">
                                    <Heading level="h5">Exercises</Heading>
                                    {exercises.map((ex, i) => (
                                        <ExerciseCard key={ex.id ?? i} exercise={ex}/>
                                    ))}
                                </View>
                            )}

                            {/* Session history */}
                            {!workout?.isTemplate && (
                                <View className="gap-3">
                                    <Heading level="h5">History</Heading>
                                    {isSessionsLoading ? (
                                        <Card padding="md" className="gap-3">
                                            {Array.from({length: 3}).map((_, i) => (
                                                <View key={i} className="gap-1">
                                                    <Skeleton height={13} width="50%" rounded="md"/>
                                                    <Skeleton height={11} width="30%" rounded="md"/>
                                                </View>
                                            ))}
                                        </Card>
                                    ) : sessions.length === 0 ? (
                                        <View className="flex-row items-center gap-2 py-2">
                                            <Ionicons name="time-outline" size={16} color="#9ca3af"/>
                                            <Typography variant="body-sm" className="text-muted-foreground">
                                                No sessions yet
                                            </Typography>
                                        </View>
                                    ) : (
                                        <Card padding="none" className="overflow-hidden">
                                            {sessions.map((s, idx) => {
                                                const duration = formatDuration(s.startedAt, s.finishedAt);
                                                const isLast = idx === sessions.length - 1;
                                                return (
                                                    <Pressable
                                                        key={s.id}
                                                        onPress={() => router.push({
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            pathname: '/workout-session/[id]' as any,
                                                            params: {id: s.id!},
                                                        })}
                                                        className="px-4 active:bg-muted"
                                                        style={[{paddingVertical: 14}, !isLast ? {borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.08)'} : undefined]}
                                                    >
                                                        <View className="flex-row items-center justify-between">
                                                            <View className="gap-1">
                                                                <Typography variant="body-sm" className="font-medium text-foreground">
                                                                    {formatDate(s.startedAt)}
                                                                </Typography>
                                                                {duration && (
                                                                    <View className="flex-row items-center gap-1">
                                                                        <Ionicons name="time-outline" size={13} color="#9ca3af"/>
                                                                        <Typography variant="caption" className="text-muted-foreground">
                                                                            {duration}
                                                                        </Typography>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <View className="flex-row items-center gap-2">
                                                                <Badge
                                                                    label={sessionStatusLabel(s.status)}
                                                                    variant={sessionStatusVariant(s.status)}
                                                                />
                                                                <Ionicons name="chevron-forward" size={16} color="#9ca3af"/>
                                                            </View>
                                                        </View>
                                                    </Pressable>
                                                );
                                            })}
                                            {isSessionsPending && sessions.length > 0 && (
                                                <View className="px-4 py-3 gap-2">
                                                    <Skeleton height={13} width="50%" rounded="md"/>
                                                </View>
                                            )}
                                        </Card>
                                    )}
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>

                {/* Sticky Start button — hidden for templates */}
                {!isLoading && !workout?.isTemplate && (
                    <View
                        className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-4"
                        style={{paddingBottom: Platform.OS === 'ios' ? 36 : 28}}
                    >
                        {inProgressSession ? (
                            <Button
                                label="Continue Workout"
                                onPress={() => router.push({
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    pathname: '/workout-session/[id]' as any,
                                    params: {id: inProgressSession.id!},
                                })}
                            />
                        ) : (
                            <Button
                                label="Start Workout"
                                onPress={confirmStart}
                                loading={isStarting}
                            />
                        )}
                    </View>
                )}
            </View>
        </DetailLayout>
    );
}
