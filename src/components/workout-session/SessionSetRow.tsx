import {useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';
import {SET_TYPE_LABELS} from '@/src/lib/schemas/workouts/workoutCreate';

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


export function SessionSetRow({index, result, metric, onChange, readOnly}: SessionSetRowProps) {
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

    function handleNoteToggle() {
        if (noteOpen && hasNote) {
            onChange({note: undefined});
        }
        setNoteOpen(o => !o);
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
                        onPress={() => onChange({completed: !isCompleted})}
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
            <View className="flex-row gap-2">
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
                    <ActualInput
                        value={result.timeSeconds}
                        label="Time (s)"
                        placeholder="—"
                        onCommit={v => onChange({timeSeconds: v})}
                        readOnly={readOnly}
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
                <ActualInput
                    value={result.restDurationSeconds}
                    label="Rest (s)"
                    placeholder="—"
                    onCommit={v => onChange({restDurationSeconds: v})}
                    readOnly={readOnly}
                />
            </View>

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
