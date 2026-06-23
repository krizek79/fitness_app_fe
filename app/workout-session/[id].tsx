import {useEffect, useRef, useState} from 'react';
import {Alert, Image, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, TextInput, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {
    useDeleteWorkoutSession,
    useGetWorkoutSessionById,
    useUpdateWorkoutSession,
} from '@/src/api/generated/workout-session/workout-session';
import type {
    WorkoutSessionDetailResponse,
    WorkoutSessionInputRequest,
} from '@/src/api/generated/model';
import {WorkoutSessionInputRequestStatus} from '@/src/api/generated/model/workoutSessionInputRequestStatus';
import {WorkoutExerciseSetResultInputRequestWorkoutExerciseSetType} from '@/src/api/generated/model/workoutExerciseSetResultInputRequestWorkoutExerciseSetType';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {Badge} from '@/src/components/primitives/ui/Badge';
import {Button} from '@/src/components/primitives/ui/Button';
import {Card} from '@/src/components/primitives/ui/Card';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {SessionSetRow, type SessionSetUpdate} from '@/src/components/workout-session/SessionSetRow';
import {themeColors} from '@/src/constants/colors';
import {useColorScheme} from 'nativewind';
import {toast} from '@/src/lib/toast';

// ── Local state types ────────────────────────────────────────────────────────

interface LocalSetResult {
    id?: number;
    workoutExerciseSetId?: number;
    order: number;
    workoutExerciseSetType: string;
    repetitions?: number;
    weight?: number;
    timeSeconds?: number;
    distanceMeters?: number;
    restDurationSeconds?: number;
    completed?: boolean;
    note?: string;
}

interface LocalExercise {
    id?: number;
    workoutExerciseId: number;
    order: number;
    exerciseName: string;
    thumbnailUrl?: string;
    metric: string;
    note?: string;
    sets: LocalSetResult[];
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapToLocal(session: WorkoutSessionDetailResponse): LocalExercise[] {
    return (session.workoutExerciseSessions ?? []).map(ex => ({
        id: ex.id,
        workoutExerciseId: ex.workoutExercise?.id!,
        order: ex.order!,
        exerciseName: ex.workoutExercise?.exercise?.title ?? 'Exercise',
        thumbnailUrl: ex.workoutExercise?.exercise?.thumbnailUrl,
        metric: ex.workoutExercise?.workoutExerciseMetric?.key ?? 'REPS',
        note: ex.note,
        sets: (ex.workoutExerciseSetResults ?? []).map(s => ({
            id: s.id,
            workoutExerciseSetId: s.workoutExerciseSetId,
            order: s.order!,
            workoutExerciseSetType: s.workoutExerciseSetType?.key ?? 'STRAIGHT_SET',
            repetitions: s.repetitions,
            weight: s.weight,
            timeSeconds: s.timeSeconds,
            distanceMeters: s.distanceMeters,
            restDurationSeconds: s.restDurationSeconds,
            completed: s.completed ?? false,
            note: s.note,
        })),
    }));
}

function buildUpdateBody(
    session: WorkoutSessionDetailResponse,
    exercises: LocalExercise[],
    status: WorkoutSessionInputRequestStatus,
    finishedAt?: string,
): WorkoutSessionInputRequest {
    return {
        workoutId: undefined as unknown as number, // must be omitted on update per API contract
        status,
        startedAt: session.startedAt,
        finishedAt: finishedAt ?? session.finishedAt ?? undefined,
        workoutExerciseSessions: exercises.map(ex => ({
            id: ex.id,
            workoutExerciseId: ex.workoutExerciseId,
            order: ex.order,
            note: ex.note,
            workoutExerciseSetResults: ex.sets.map(s => ({
                id: s.id,
                workoutExerciseSetId: s.workoutExerciseSetId,
                order: s.order,
                workoutExerciseSetType: s.workoutExerciseSetType as WorkoutExerciseSetResultInputRequestWorkoutExerciseSetType,
                repetitions: s.repetitions,
                weight: s.weight,
                timeSeconds: s.timeSeconds,
                distanceMeters: s.distanceMeters,
                restDurationSeconds: s.restDurationSeconds,
                completed: s.completed,
                note: s.note,
            })),
        })),
    };
}

// ── Status helpers ───────────────────────────────────────────────────────────

type SessionStatus = WorkoutSessionInputRequestStatus;

function statusBadgeVariant(status?: string): 'success' | 'warning' | 'muted' {
    if (status === 'COMPLETED') return 'success';
    if (status === 'IN_PROGRESS') return 'warning';
    return 'muted';
}

function statusBadgeLabel(status?: string): string {
    if (status === 'COMPLETED') return 'Completed';
    if (status === 'IN_PROGRESS') return 'In progress';
    if (status === 'SKIPPED') return 'Skipped';
    return 'Not started';
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SessionSkeleton() {
    return (
        <SkeletonGroup gap={16}>
            <Skeleton height={22} width="60%" rounded="md"/>
            {Array.from({length: 3}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <Skeleton height={18} width="50%" rounded="md"/>
                    <Skeleton height={40} width="100%" rounded="md"/>
                    <Skeleton height={40} width="100%" rounded="md"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

// ── Exercise note ─────────────────────────────────────────────────────────────

function ExerciseNoteInput({value, onChange, readOnly}: {value: string; onChange: (v: string) => void; readOnly: boolean}) {
    const [expanded, setExpanded] = useState(!!value);
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const hasNote = !!value;

    function handleToggle() {
        if (expanded && hasNote) onChange('');
        setExpanded(o => !o);
    }

    return (
        <View className="gap-2">
            {!readOnly && (
                <Pressable
                    onPress={handleToggle}
                    accessibilityLabel={expanded ? 'Remove note' : 'Add exercise note'}
                    className="flex-row items-center gap-2 rounded-lg border px-3"
                    style={{
                        height: 36,
                        borderColor: hasNote ? palette.primary : palette.border,
                        backgroundColor: hasNote ? 'rgba(250,204,21,0.08)' : 'transparent',
                        alignSelf: 'flex-start',
                    }}
                >
                    <Ionicons
                        name={hasNote ? 'create' : 'create-outline'}
                        size={14}
                        color={hasNote ? palette.primary : palette.mutedForeground}
                    />
                    <Typography
                        variant="caption"
                        className={hasNote ? 'font-medium' : 'text-muted-foreground'}
                        style={hasNote ? {color: palette.primary} : undefined}
                    >
                        {expanded ? (hasNote ? 'Clear note' : 'Cancel') : (hasNote ? 'Edit note' : 'Add note')}
                    </Typography>
                </Pressable>
            )}
            {(expanded || (readOnly && hasNote)) && (
                <View
                    className="rounded-lg border border-input bg-background flex-row items-start px-3 gap-2"
                    style={{minHeight: 48, paddingVertical: 12}}
                >
                    <Ionicons name="create-outline" size={15} color={palette.mutedForeground} style={{marginTop: 1}}/>
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Exercise note…"
                        placeholderTextColor={palette.mutedForeground}
                        multiline
                        editable={!readOnly}
                        style={{flex: 1, color: palette.foreground, fontSize: 14, lineHeight: 20}}
                    />
                </View>
            )}
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WorkoutSessionScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const sessionId = Number(id);
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: session, isLoading, refetch, isRefetching} = useGetWorkoutSessionById(sessionId);
    const {mutate: saveSession} = useUpdateWorkoutSession();
    const {mutate: deleteSession, isPending: isDeleting} = useDeleteWorkoutSession();

    const [exercises, setExercises] = useState<LocalExercise[]>([]);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>(WorkoutSessionInputRequestStatus.IN_PROGRESS);

    // Populated once on first successful fetch; re-populates if the id changes
    const initializedRef = useRef(false);
    const dirtyRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!session || initializedRef.current) return;
        setExercises(mapToLocal(session));
        setSessionStatus((session.status ?? 'IN_PROGRESS') as SessionStatus);
        initializedRef.current = true;
    }, [session]);

    // Auto-save whenever exercises or status change (but not on initial population)
    useEffect(() => {
        if (!dirtyRef.current || !session || isReadOnly) return;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveSession(
                {id: sessionId, data: buildUpdateBody(session, exercises, sessionStatus)},
                {onError: () => toast.error('Auto-save failed', undefined, 'session-save-error')},
            );
        }, 1500);
        return () => clearTimeout(saveTimerRef.current);
    }, [exercises, sessionStatus]);

    const isReadOnly = session?.status === 'COMPLETED' || session?.status === 'SKIPPED';

    // ── Set result mutations ──────────────────────────────────────────────────

    function updateSetResult(exIdx: number, setIdx: number, partial: SessionSetUpdate) {
        dirtyRef.current = true;
        setExercises(prev =>
            prev.map((ex, ei) =>
                ei !== exIdx
                    ? ex
                    : {
                          ...ex,
                          sets: ex.sets.map((s, si): LocalSetResult =>
                              si !== setIdx ? s : {...s, ...partial},
                          ),
                      },
            ),
        );
    }

    function updateExerciseNote(exIdx: number, note: string) {
        dirtyRef.current = true;
        setExercises(prev =>
            prev.map((ex, ei) => (ei !== exIdx ? ex : {...ex, note: note || undefined})),
        );
    }

    // ── Finish ────────────────────────────────────────────────────────────────

    function doFinish() {
        if (!session) return;
        clearTimeout(saveTimerRef.current);
        const finishedAt = new Date().toISOString();
        saveSession(
            {
                id: sessionId,
                data: buildUpdateBody(session, exercises, WorkoutSessionInputRequestStatus.COMPLETED, finishedAt),
            },
            {
                onSuccess: () => {
                    toast.success('Workout complete!');
                    router.back();
                },
                onError: () => toast.error('Failed to finish workout.'),
            },
        );
    }

    function handleFinish() {
        if (Platform.OS === 'web') { doFinish(); return; }
        Alert.alert('Finish workout', 'Mark this workout as completed?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Finish', onPress: doFinish},
        ]);
    }

    // ── Discard ───────────────────────────────────────────────────────────────

    function doDiscard() {
        clearTimeout(saveTimerRef.current);
        deleteSession(
            {id: sessionId},
            {
                onSuccess: () => { toast.info('Workout discarded.'); router.back(); },
                onError: () => toast.error('Failed to discard workout.'),
            },
        );
    }

    function handleDiscard() {
        if (Platform.OS === 'web') {
            if (window.confirm('Discard this workout session? This cannot be undone.')) doDiscard();
            return;
        }
        Alert.alert('Discard workout', 'Delete this session? This cannot be undone.', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Discard', style: 'destructive', onPress: doDiscard},
        ]);
    }

    // ── Header right ──────────────────────────────────────────────────────────

    const headerRight = !isLoading && !isReadOnly ? (
        <Pressable
            onPress={handleDiscard}
            disabled={isDeleting}
            accessibilityLabel="Discard session"
            style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
        >
            <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
        </Pressable>
    ) : undefined;

    return (
        <DetailLayout
            title={isLoading ? 'Loading…' : (session?.workout?.title ?? 'Workout')}
            headerRight={headerRight}
        >
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior="padding"
                keyboardVerticalOffset={88}
            >
                <ScrollView
                    contentContainerStyle={{padding: 24, gap: 16, paddingBottom: 24, ...webContentStyle}}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={Platform.OS !== 'web' ? (
                        <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()}/>
                    ) : undefined}
                >
                    {isLoading ? (
                        <SessionSkeleton/>
                    ) : (
                        <>
                            {/* Status badge */}
                            <View className="flex-row items-center gap-3">
                                <Badge
                                    label={statusBadgeLabel(sessionStatus)}
                                    variant={statusBadgeVariant(sessionStatus)}
                                />
                                {session?.startedAt && (
                                    <Typography variant="caption" className="text-muted-foreground">
                                        {new Date(session.startedAt).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                        })}
                                    </Typography>
                                )}
                            </View>

                            {/* Exercises */}
                            {exercises.map((ex, exIdx) => (
                                <Card key={ex.id ?? exIdx} padding="md" className="gap-3">
                                    <View className="flex-row items-center gap-3">
                                        <View className="bg-muted items-center justify-center overflow-hidden" style={{width: 48, height: 48, borderRadius: 8}}>
                                            {ex.thumbnailUrl ? (
                                                Platform.OS === 'web' ? (
                                                    // @ts-ignore
                                                    <img src={ex.thumbnailUrl} style={{width: 48, height: 48, objectFit: 'cover'}} alt=""/>
                                                ) : (
                                                    <Image source={{uri: ex.thumbnailUrl}} style={{width: 48, height: 48}} resizeMode="cover"/>
                                                )
                                            ) : (
                                                <Ionicons name="barbell-outline" size={22} color="#9ca3af"/>
                                            )}
                                        </View>
                                        <View className="flex-1 flex-row items-center justify-between">
                                            <Heading level="h5" className="flex-1 mr-2">{ex.exerciseName}</Heading>
                                            {ex.sets.every(s => s.completed) && ex.sets.length > 0 && (
                                                <Ionicons name="checkmark-circle" size={18} color="#22c55e"/>
                                            )}
                                        </View>
                                    </View>

                                    {ex.sets.map((s, setIdx) => (
                                        <SessionSetRow
                                            key={s.id ?? setIdx}
                                            index={setIdx}
                                            result={s}
                                            metric={ex.metric}
                                            onChange={partial => updateSetResult(exIdx, setIdx, partial)}
                                            readOnly={isReadOnly}
                                        />
                                    ))}

                                    <ExerciseNoteInput
                                        value={ex.note ?? ''}
                                        onChange={note => updateExerciseNote(exIdx, note)}
                                        readOnly={isReadOnly}
                                    />
                                </Card>
                            ))}
                        </>
                    )}
                </ScrollView>

                {/* Footer actions */}
                {!isLoading && (
                    <View
                        className="bg-background border-t border-border px-6 py-4"
                        style={{paddingBottom: Platform.OS === 'ios' ? 24 : 16, gap: 10}}
                    >
                        {isReadOnly ? (
                            <Typography variant="body-sm" className="text-center text-muted-foreground">
                                {session?.finishedAt
                                    ? `Completed on ${new Date(session.finishedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}`
                                    : 'This session is read-only.'}
                            </Typography>
                        ) : (
                            <Button label="Finish Workout" onPress={handleFinish}/>
                        )}
                    </View>
                )}
            </KeyboardAvoidingView>
        </DetailLayout>
    );
}
