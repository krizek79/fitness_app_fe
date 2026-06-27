import {useEffect, useRef, useState} from 'react';
import {Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View} from 'react-native';
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

interface MuscleInfo {
    name: string;
    role: 'PRIMARY' | 'SECONDARY' | string;
}

interface EquipmentInfo {
    title: string;
    thumbnailUrl?: string;
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
    equipment: EquipmentInfo[];
    movementPatterns: string[];
    muscles: MuscleInfo[];
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapToLocal(session: WorkoutSessionDetailResponse): LocalExercise[] {
    return (session.workoutExerciseSessions ?? []).map(ex => {
        const exercise = ex.workoutExercise?.exercise;
        return {
            id: ex.id,
            workoutExerciseId: ex.workoutExercise?.id!,
            order: ex.order!,
            exerciseName: exercise?.title ?? 'Exercise',
            thumbnailUrl: exercise?.thumbnailUrl,
            metric: ex.workoutExercise?.workoutExerciseMetric?.key ?? 'REPS',
            note: ex.note,
            equipment: (exercise?.requiredEquipment ?? [])
                .filter(e => e.title)
                .map(e => ({title: e.title!, thumbnailUrl: e.thumbnailUrl})),
            movementPatterns: (exercise?.movementPatterns ?? []).map(p => p.value ?? '').filter(Boolean),
            muscles: (exercise?.muscles ?? []).map(m => ({
                name: m.muscle?.value ?? '',
                role: m.type?.key ?? 'PRIMARY',
            })).filter(m => m.name),
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
        };
    });
}

function buildUpdateBody(
    session: WorkoutSessionDetailResponse,
    exercises: LocalExercise[],
    status: WorkoutSessionInputRequestStatus,
    finishedAt?: string,
): WorkoutSessionInputRequest {
    return {
        workoutId: undefined as unknown as number,
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
            <Skeleton height={6} width="100%" rounded="md"/>
            <Skeleton height={22} width="50%" rounded="md"/>
            <Skeleton height={16} width="70%" rounded="md"/>
            <View className="gap-3">
                {Array.from({length: 3}).map((_, i) => (
                    <Skeleton key={i} height={72} width="100%" rounded="md"/>
                ))}
            </View>
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

// ── Info pill ─────────────────────────────────────────────────────────────────

function InfoPill({label, color}: {label: string; color: 'blue' | 'teal' | 'rose' | 'indigo'}) {
    const styles: Record<string, {bg: string; text: string}> = {
        blue:   {bg: 'rgba(55,138,221,0.12)',  text: '#0C447C'},
        teal:   {bg: 'rgba(29,158,117,0.12)',  text: '#085041'},
        rose:   {bg: 'rgba(244,63,94,0.13)',   text: '#9F1239'},
        indigo: {bg: 'rgba(99,102,241,0.12)',  text: '#3730A3'},
    };
    const s = styles[color];
    return (
        <View
            className="rounded-full px-3 flex-row items-center"
            style={{paddingVertical: 4, backgroundColor: s.bg}}
        >
            <Typography variant="caption" style={{color: s.text, fontSize: 11}}>{label}</Typography>
        </View>
    );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({current, total}: {current: number; total: number}) {
    const pct = total > 0 ? ((current + 1) / total) * 100 : 0;
    return (
        <View className="bg-muted" style={{height: 4}}>
            <View
                className="bg-primary"
                style={{height: 4, width: `${pct}%`}}
            />
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

    const {data: session, isLoading, refetch} = useGetWorkoutSessionById(sessionId);
    const {mutate: saveSession} = useUpdateWorkoutSession();
    const {mutate: deleteSession, isPending: isDeleting} = useDeleteWorkoutSession();

    const [exercises, setExercises] = useState<LocalExercise[]>([]);
    const [sessionStatus, setSessionStatus] = useState<SessionStatus>(WorkoutSessionInputRequestStatus.IN_PROGRESS);
    const [currentIndex, setCurrentIndex] = useState(0);

    const initializedRef = useRef(false);
    const dirtyRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!session || initializedRef.current) return;
        setExercises(mapToLocal(session));
        setSessionStatus((session.status ?? 'IN_PROGRESS') as SessionStatus);
        initializedRef.current = true;
    }, [session]);

    const isReadOnly = session?.status === 'COMPLETED' || session?.status === 'SKIPPED';

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
    }, [exercises, sessionStatus, isReadOnly]);

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

    // ── Navigation ────────────────────────────────────────────────────────────

    const total = exercises.length;
    const safeIndex = Math.min(currentIndex, Math.max(total - 1, 0));
    const ex = exercises[safeIndex];

    function goPrev() { setCurrentIndex(i => Math.max(i - 1, 0)); }
    function goNext() { setCurrentIndex(i => Math.min(i + 1, total - 1)); }

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

    // ── Delete (completed / skipped sessions) ────────────────────────────────

    function doDelete() {
        deleteSession(
            {id: sessionId},
            {
                onSuccess: () => { toast.info('Session deleted.'); router.back(); },
                onError: () => toast.error('Failed to delete session.'),
            },
        );
    }

    function handleDelete() {
        if (Platform.OS === 'web') {
            if (window.confirm('Delete this session? This cannot be undone.')) doDelete();
            return;
        }
        Alert.alert('Delete session', 'Delete this session? This cannot be undone.', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Delete', style: 'destructive', onPress: doDelete},
        ]);
    }

    // ── Header right ──────────────────────────────────────────────────────────

    const headerRight = !isLoading ? (
        <Pressable
            onPress={isReadOnly ? handleDelete : handleDiscard}
            disabled={isDeleting}
            accessibilityLabel={isReadOnly ? 'Delete session' : 'Discard session'}
            style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
        >
            <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
        </Pressable>
    ) : undefined;

    // ── Primary / secondary muscles ───────────────────────────────────────────

    const primaryMuscles = ex?.muscles.filter(m => m.role !== 'SECONDARY') ?? [];
    const secondaryMuscles = ex?.muscles.filter(m => m.role === 'SECONDARY') ?? [];

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
                {/* Progress bar */}
                {!isLoading && total > 0 && (
                    <ProgressBar current={safeIndex} total={total}/>
                )}

                <ScrollView
                    contentContainerStyle={{padding: 24, gap: 16, paddingBottom: 24, ...webContentStyle}}
                    keyboardShouldPersistTaps="handled"
                    key={safeIndex}
                >
                    {isLoading ? (
                        <SessionSkeleton/>
                    ) : !ex ? (
                        <Typography variant="body-sm" className="text-muted-foreground text-center">
                            No exercises in this session.
                        </Typography>
                    ) : (
                        <>
                            {/* Status + date */}
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
                                <View className="flex-1"/>
                                <Typography variant="caption" className="text-muted-foreground">
                                    {safeIndex + 1} / {total}
                                </Typography>
                            </View>

                            {/* Exercise header */}
                            <Card padding="md" className="gap-3">
                                <View className="flex-row items-center gap-3">
                                    <View className="bg-muted items-center justify-center overflow-hidden" style={{width: 56, height: 56, borderRadius: 10}}>
                                        {ex.thumbnailUrl ? (
                                            Platform.OS === 'web' ? (
                                                // @ts-ignore
                                                <img src={ex.thumbnailUrl} style={{width: 56, height: 56, objectFit: 'cover'}} alt=""/>
                                            ) : (
                                                <Image source={{uri: ex.thumbnailUrl}} style={{width: 56, height: 56}} resizeMode="cover"/>
                                            )
                                        ) : (
                                            <Ionicons name="barbell-outline" size={26} color="#9ca3af"/>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Heading level="h4">{ex.exerciseName}</Heading>
                                        {ex.sets.every(s => s.completed) && ex.sets.length > 0 && (
                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Ionicons name="checkmark-circle" size={14} color="#22c55e"/>
                                                <Typography variant="caption" style={{color: '#22c55e'}}>All sets done</Typography>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Info pills */}
                                {(ex.equipment.length > 0 || ex.movementPatterns.length > 0 || ex.muscles.length > 0) && (
                                    <View className="gap-2">
                                        {ex.equipment.length > 0 && (
                                            <View className="flex-row flex-wrap gap-2 items-center">
                                                <Typography variant="caption" className="text-muted-foreground">Equipment</Typography>
                                                {ex.equipment.map(e => (
                                                    <InfoPill key={e.title} label={e.title} color="blue"/>
                                                ))}
                                            </View>
                                        )}
                                        {ex.movementPatterns.length > 0 && (
                                            <View className="flex-row flex-wrap gap-2 items-center">
                                                <Typography variant="caption" className="text-muted-foreground">Movement</Typography>
                                                {ex.movementPatterns.map(p => (
                                                    <InfoPill key={p} label={p} color="teal"/>
                                                ))}
                                            </View>
                                        )}
                                        {primaryMuscles.length > 0 && (
                                            <View className="flex-row flex-wrap gap-2 items-center">
                                                <Typography variant="caption" className="text-muted-foreground">Muscles</Typography>
                                                {primaryMuscles.map(m => (
                                                    <InfoPill key={m.name} label={m.name} color="rose"/>
                                                ))}
                                                {secondaryMuscles.map(m => (
                                                    <InfoPill key={m.name} label={m.name} color="indigo"/>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </Card>

                            {/* Exercise note */}
                            <ExerciseNoteInput
                                value={ex.note ?? ''}
                                onChange={note => updateExerciseNote(safeIndex, note)}
                                readOnly={isReadOnly}
                            />

                            {/* Sets */}
                            {ex.sets.map((s, setIdx) => (
                                <SessionSetRow
                                    key={s.id ?? setIdx}
                                    index={setIdx}
                                    isLast={setIdx === ex.sets.length - 1}
                                    result={s}
                                    metric={ex.metric}
                                    onChange={partial => updateSetResult(safeIndex, setIdx, partial)}
                                    readOnly={isReadOnly}
                                />
                            ))}
                        </>
                    )}
                </ScrollView>

                {/* Footer */}
                {!isLoading && (
                    <View
                        className="bg-background border-t border-border px-6 py-4"
                        style={{paddingBottom: Platform.OS === 'ios' ? 24 : 16, gap: 12}}
                    >
                        {!isReadOnly && (
                            <Button label="Finish Workout" onPress={handleFinish}/>
                        )}

                        {/* Prev / Next navigation */}
                        {total > 1 && (
                            <View className="flex-row items-center justify-between gap-3">
                                <Pressable
                                    onPress={goPrev}
                                    disabled={safeIndex === 0}
                                    className="flex-row items-center gap-1 rounded-lg border border-border px-4"
                                    style={{height: 40, opacity: safeIndex === 0 ? 0.3 : 1}}
                                    accessibilityLabel="Previous exercise"
                                >
                                    <Ionicons name="chevron-back" size={16} color={palette.foreground}/>
                                    <Typography variant="body-sm">Prev</Typography>
                                </Pressable>

                                {/* Dot indicators (max 7 shown) */}
                                <View className="flex-row items-center gap-1 flex-1 justify-center">
                                    {total <= 7 ? (
                                        exercises.map((e, i) => {
                                            const done = e.sets.length > 0 && e.sets.every(s => s.completed);
                                            return (
                                                <Pressable
                                                    key={i}
                                                    onPress={() => setCurrentIndex(i)}
                                                    accessibilityLabel={`Go to exercise ${i + 1}`}
                                                    style={{
                                                        width: i === safeIndex ? 18 : 7,
                                                        height: 7,
                                                        borderRadius: 4,
                                                        backgroundColor: i === safeIndex
                                                            ? palette.primary
                                                            : done
                                                                ? '#22c55e'
                                                                : palette.border,
                                                    }}
                                                />
                                            );
                                        })
                                    ) : (
                                        <Typography variant="caption" className="text-muted-foreground">
                                            {safeIndex + 1} / {total}
                                        </Typography>
                                    )}
                                </View>

                                <Pressable
                                    onPress={goNext}
                                    disabled={safeIndex === total - 1}
                                    className="flex-row items-center gap-1 rounded-lg border border-border px-4"
                                    style={{height: 40, opacity: safeIndex === total - 1 ? 0.3 : 1}}
                                    accessibilityLabel="Next exercise"
                                >
                                    <Typography variant="body-sm">Next</Typography>
                                    <Ionicons name="chevron-forward" size={16} color={palette.foreground}/>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
            </KeyboardAvoidingView>
        </DetailLayout>
    );
}
