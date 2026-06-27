import {useState} from 'react';
import {Modal, Platform, Pressable, View} from 'react-native';
import {Control, Controller, useWatch} from 'react-hook-form';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {SET_TYPE_LABELS, SET_TYPE_VALUES} from '@/src/lib/schemas/workouts/workoutCreate';
import type {WorkoutCreateFormValues} from '@/src/lib/schemas/workouts/workoutCreate';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

interface SetRowProps {
    control: Control<WorkoutCreateFormValues>;
    exerciseIndex: number;
    setIndex: number;
    onRemove: () => void;
}

type SetFieldPath = `workoutExercises.${number}.workoutExerciseSets.${number}.workoutExerciseSetType`;

function SetTypePicker({control, name}: {control: Control<WorkoutCreateFormValues>; name: SetFieldPath}) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const modalBg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';
    const [open, setOpen] = useState(false);

    return (
        <Controller
            control={control}
            name={name}
            render={({field: {onChange, value}}) => (
                <>
                    <Pressable
                        onPress={() => setOpen(true)}
                        className="flex-row items-center gap-1 rounded-full border border-border bg-muted px-3"
                        style={{height: 32}}
                    >
                        <Typography variant="caption" className="font-medium text-foreground">{SET_TYPE_LABELS[value]}</Typography>
                        <Ionicons name="chevron-down" size={12} color={palette.mutedForeground}/>
                    </Pressable>

                    <Modal
                        visible={open}
                        animationType="slide"
                        presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'fullScreen'}
                        onRequestClose={() => setOpen(false)}
                    >
                        <View style={{flex: 1, backgroundColor: modalBg}}>
                            <View
                                className="flex-row items-center justify-between border-b border-border px-4"
                                style={{paddingTop: Platform.OS === 'ios' ? 16 : 48, paddingBottom: 12}}
                            >
                                <Typography variant="body" className="font-semibold text-foreground">Set Type</Typography>
                                <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                                    <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                                </Pressable>
                            </View>
                            <View className="px-4 gap-2 pt-4">
                                {SET_TYPE_VALUES.map(type => {
                                    const isSelected = type === value;
                                    return (
                                        <Pressable
                                            key={type}
                                            onPress={() => { onChange(type); setOpen(false); }}
                                            className="flex-row items-center justify-between rounded-xl border px-4 py-4"
                                            style={{borderColor: isSelected ? palette.primary : palette.border, backgroundColor: isSelected ? palette.primary + '15' : 'transparent'}}
                                        >
                                            <Typography variant="body" className="font-medium text-foreground">{SET_TYPE_LABELS[type]}</Typography>
                                            {isSelected && <Ionicons name="checkmark" size={20} color={palette.primary}/>}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        />
    );
}

export function SetRow({control, exerciseIndex, setIndex, onRemove}: SetRowProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const base = `workoutExercises.${exerciseIndex}.workoutExerciseSets.${setIndex}` as const;

    const noteValue = useWatch({control, name: `${base}.note` as `workoutExercises.${number}.workoutExerciseSets.${number}.note`});
    const [noteExpanded, setNoteExpanded] = useState(false);

    return (
        <View className="rounded-lg border border-border bg-card p-3 gap-2">
            {/* Row 1: set number + type picker + note toggle + delete */}
            <View className="flex-row items-center gap-2">
                <View className="w-6 h-6 rounded-full bg-muted items-center justify-center">
                    <Typography variant="caption" className="font-bold text-muted-foreground">{setIndex + 1}</Typography>
                </View>
                <SetTypePicker control={control} name={`${base}.workoutExerciseSetType` as SetFieldPath}/>
                <View className="flex-1"/>
                <Pressable onPress={() => setNoteExpanded(v => !v)} hitSlop={8}>
                    <Ionicons
                        name={noteExpanded || noteValue ? 'chatbubble' : 'chatbubble-outline'}
                        size={16}
                        color={noteValue ? palette.primary : palette.mutedForeground}
                    />
                </Pressable>
                <Pressable onPress={onRemove} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color={palette.mutedForeground}/>
                </Pressable>
            </View>

            {/* Note (optional) */}
            {(noteExpanded || noteValue) && (
                <Controller
                    control={control}
                    name={`${base}.note` as `workoutExercises.${number}.workoutExerciseSets.${number}.note`}
                    render={({field: {onChange, value}}) => (
                        <TextInput
                            value={value ?? ''}
                            onChangeText={onChange}
                            placeholder="Set note..."
                            placeholderTextColor={palette.mutedForeground}
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            style={{minHeight: 36, textAlignVertical: 'top'}}
                            multiline
                        />
                    )}
                />
            )}
        </View>
    );
}
