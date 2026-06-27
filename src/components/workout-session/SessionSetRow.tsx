import {useEffect, useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';
import {SET_TYPE_LABELS} from '@/src/lib/schemas/workouts/workoutCreate';

function toMinSec(totalSeconds?: number): {min: string; sec: string} {
    if (totalSeconds == null) return {min: '', sec: ''};
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return {min: String(m), sec: s < 10 ? `0${s}` : String(s)};
}

function fromMinSec(min: string, sec: string): number | undefined {
    const m = parseInt(min, 10);
    const s = parseInt(sec, 10);
    if (isNaN(m) && isNaN(s)) return undefined;
    return (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : Math.min(s, 59));
}

function TimeInput({
    value,
    label,
    onCommit,
    readOnly,
    palette,
}: {
    value?: number;
    label: string;
    onCommit: (v: number | undefined) => void;
    readOnly: boolean;
    palette: {foreground: string; mutedForeground: string; [key: string]: string};
}) {
    const committedRef = useRef(value);
    const init = toMinSec(value);
    const [min, setMin] = useState(init.min);
    const [sec, setSec] = useState(init.sec);

    // Sync from props when the value changed externally (not from our own commit).
    // useEffect instead of render-time setState to avoid discarding the current render.
    useEffect(() => {
        if (value === committedRef.current) return;
        committedRef.current = value;
        const next = toMinSec(value);
        setMin(next.min);
        setSec(next.sec);
    }, [value]);

    function handleMinChange(text: string) {
        setMin(text);
        const next = fromMinSec(text, sec);
        committedRef.current = next;
        onCommit(next);
    }

    function handleSecChange(text: string) {
        const clamped = text === '' ? '' : String(Math.min(parseInt(text, 10) || 0, 59));
        setSec(clamped);
        const next = fromMinSec(min, clamped);
        committedRef.current = next;
        onCommit(next);
    }

    const inputStyle = {
        height: 40,
        opacity: readOnly ? 0.6 : 1,
        color: palette.foreground,
        fontSize: 15,
        textAlign: 'center' as const,
    };

    return (
        <View style={{flex: 1, minWidth: 0, gap: 4}}>
            <Typography variant="caption" className="text-muted-foreground">{label}</Typography>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <TextInput
                    value={min}
                    onChangeText={handleMinChange}
                    placeholder="0"
                    placeholderTextColor={palette.mutedForeground}
                    keyboardType="number-pad"
                    editable={!readOnly}
                    scrollEnabled={false}
                    className="rounded-md border border-input bg-background text-base text-foreground"
                    style={[inputStyle, {flex: 1, minWidth: 0, paddingHorizontal: 4}]}
                    maxLength={3}
                    accessibilityLabel={`${label} minutes`}
                />
                <Typography variant="body-sm" className="text-muted-foreground font-medium">:</Typography>
                <TextInput
                    value={sec}
                    onChangeText={handleSecChange}
                    placeholder="00"
                    placeholderTextColor={palette.mutedForeground}
                    keyboardType="number-pad"
                    editable={!readOnly}
                    scrollEnabled={false}
                    className="rounded-md border border-input bg-background text-base text-foreground"
                    style={[inputStyle, {flex: 1, minWidth: 0, paddingHorizontal: 4}]}
                    maxLength={2}
                    accessibilityLabel={`${label} seconds`}
                />
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2}}>
                <Typography variant="caption" className="text-muted-foreground" style={{fontSize: 9}}>min</Typography>
                <Typography variant="caption" className="text-muted-foreground" style={{fontSize: 9}}>sec</Typography>
            </View>
        </View>
    );
}

export interface SessionSetUpdate {
    completed?: boolean;
    repetitions?: number;
    weight?: number;
    timeSeconds?: number;
    distanceMeters?: number;
    restDurationSeconds?: number;
    note?: string;
}

export interface SessionSetDisplay {
    workoutExerciseSetType?: string;
    repetitions?: number;
    weight?: number;
    timeSeconds?: number;
    distanceMeters?: number;
    restDurationSeconds?: number;
    completed?: boolean;
    note?: string;
}

interface SessionSetRowProps {
    index: number;
    isLast: boolean;
    result: SessionSetDisplay;
    metric: string;
    onChange: (partial: SessionSetUpdate) => void;
    readOnly: boolean;
}

function ActualInput({
    value,
    label,
    placeholder,
    onCommit,
    readOnly,
}: {
    value?: number;
    label: string;
    placeholder: string;
    onCommit: (v: number | undefined) => void;
    readOnly: boolean;
}) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const [local, setLocal] = useState(() => value != null ? String(value) : '');
    const prevValue = useRef(value);

    if (prevValue.current !== value) {
        prevValue.current = value;
        const canonical = value != null ? String(value) : '';
        if (canonical !== local) setLocal(canonical);
    }

    return (
        <View className="flex-1 gap-1">
            <Typography variant="caption" className="text-muted-foreground">{label}</Typography>
            <TextInput
                value={local}
                onChangeText={text => {
                    setLocal(text);
                    const n = parseFloat(text);
                    onCommit(isNaN(n) ? undefined : n);
                }}
                placeholder={placeholder}
                placeholderTextColor={palette.mutedForeground}
                keyboardType="numeric"
                editable={!readOnly}
                scrollEnabled={false}
                className="rounded-md border border-input bg-background px-3 text-base text-foreground"
                style={{height: 40, opacity: readOnly ? 0.6 : 1}}
            />
        </View>
    );
}


export function SessionSetRow({index, isLast, result, metric, onChange, readOnly}: SessionSetRowProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const [noteOpen, setNoteOpen] = useState(!!result.note);

    const showReps = metric === 'REPS' || metric === 'REPS_AND_WEIGHT';
    const showWeight = metric === 'REPS_AND_WEIGHT' || metric === 'TIME_AND_WEIGHT';
    const showTime = metric === 'TIME' || metric === 'TIME_AND_WEIGHT' || metric === 'DISTANCE_AND_TIME';
    const showDistance = metric === 'DISTANCE' || metric === 'DISTANCE_AND_TIME';

    const typeKey = result.workoutExerciseSetType as keyof typeof SET_TYPE_LABELS | undefined;
    const typeLabel = (typeKey && SET_TYPE_LABELS[typeKey]) ?? result.workoutExerciseSetType ?? '';

    const isCompleted = !!result.completed;
    const hasNote = !!result.note;
    const [validationError, setValidationError] = useState<string | null>(null);

    function handleNoteToggle() {
        if (noteOpen && hasNote) {
            onChange({note: undefined});
        }
        setNoteOpen(o => !o);
    }

    function handleToggleComplete() {
        if (isCompleted) {
            setValidationError(null);
            onChange({completed: false});
            return;
        }
        const missing: string[] = [];
        if (showReps && (result.repetitions == null || result.repetitions <= 0)) missing.push('Reps');
        if (showWeight && (result.weight == null || result.weight <= 0)) missing.push('Weight');
        if (showTime && (result.timeSeconds == null || result.timeSeconds <= 0)) missing.push('Time');
        if (showDistance && (result.distanceMeters == null || result.distanceMeters <= 0)) missing.push('Distance');
        if (missing.length > 0) {
            setValidationError(`Fill in ${missing.join(', ')} before completing this set.`);
            return;
        }
        setValidationError(null);
        onChange({completed: true});
    }

    return (
        <View
            className={`rounded-lg border p-3 gap-2 ${
                isCompleted ? 'bg-success/5 border-success/30' : 'bg-card border-border'
            }`}
        >
            {/* Row 1: index + type badge + note toggle + completed toggle */}
            <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-muted items-center justify-center">
                    <Typography variant="caption" className="font-bold text-muted-foreground">
                        {index + 1}
                    </Typography>
                </View>
                <View className="rounded-full bg-muted px-3" style={{paddingVertical: 3}}>
                    <Typography variant="caption" className="font-medium text-foreground">{typeLabel}</Typography>
                </View>
                <View className="flex-1"/>
                {!readOnly && (
                    <Pressable
                        onPress={handleNoteToggle}
                        hitSlop={8}
                        accessibilityLabel={noteOpen ? 'Remove note' : 'Add note'}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            borderWidth: 1.5,
                            borderColor: hasNote ? palette.primary : palette.border,
                            backgroundColor: hasNote ? 'rgba(250,204,21,0.13)' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons
                            name={hasNote ? 'create' : 'create-outline'}
                            size={14}
                            color={hasNote ? palette.primary : palette.mutedForeground}
                        />
                    </Pressable>
                )}
                {readOnly ? (
                    isCompleted && <Ionicons name="checkmark-circle" size={20} color="#22c55e"/>
                ) : (
                    <Pressable
                        onPress={handleToggleComplete}
                        hitSlop={8}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            borderWidth: 2,
                            borderColor: isCompleted ? '#22c55e' : palette.mutedForeground,
                            backgroundColor: isCompleted ? '#22c55e' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isCompleted && <Ionicons name="checkmark" size={14} color="#fff"/>}
                    </Pressable>
                )}
            </View>

            {/* Row 2: actual value inputs */}
            <View className="flex-row gap-2" style={{minWidth: 0}}>
                {showReps && (
                    <ActualInput
                        value={result.repetitions}
                        label="Reps"
                        placeholder="—"
                        onCommit={v => onChange({repetitions: v})}
                        readOnly={readOnly}
                    />
                )}
                {showWeight && (
                    <ActualInput
                        value={result.weight}
                        label="Weight"
                        placeholder="—"
                        onCommit={v => onChange({weight: v})}
                        readOnly={readOnly}
                    />
                )}
                {showTime && (
                    <TimeInput
                        value={result.timeSeconds}
                        label="Time"
                        onCommit={v => onChange({timeSeconds: v})}
                        readOnly={readOnly}
                        palette={palette}
                    />
                )}
                {showDistance && (
                    <ActualInput
                        value={result.distanceMeters}
                        label="Dist (m)"
                        placeholder="—"
                        onCommit={v => onChange({distanceMeters: v})}
                        readOnly={readOnly}
                    />
                )}
                {!isLast && (
                    <TimeInput
                        value={result.restDurationSeconds}
                        label="Rest"
                        onCommit={v => onChange({restDurationSeconds: v})}
                        readOnly={readOnly}
                        palette={palette}
                    />
                )}
            </View>

            {/* Validation error */}
            {validationError && (
                <Typography variant="caption" style={{color: '#ef4444'}}>{validationError}</Typography>
            )}

            {/* Note input — shown when toggled or when a note exists in read-only */}
            {(noteOpen || (readOnly && hasNote)) && (
                <View
                    className="rounded-md border border-input bg-background flex-row items-start px-3 gap-2"
                    style={{minHeight: 40, paddingVertical: 10}}
                >
                    <Ionicons name="create-outline" size={14} color={palette.mutedForeground} style={{marginTop: 1}}/>
                    <TextInput
                        value={result.note ?? ''}
                        onChangeText={v => onChange({note: v || undefined})}
                        placeholder="Set note…"
                        placeholderTextColor={palette.mutedForeground}
                        multiline
                        editable={!readOnly}
                        style={{flex: 1, color: palette.foreground, fontSize: 13, lineHeight: 18}}
                    />
                </View>
            )}
        </View>
    );
}
