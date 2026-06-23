import {Modal, Platform, Pressable, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {METRIC_LABELS, METRIC_VALUES} from '@/src/lib/schemas/workouts/workoutCreate';
import type {WorkoutExerciseFormValues} from '@/src/lib/schemas/workouts/workoutCreate';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

type MetricValue = WorkoutExerciseFormValues['workoutExerciseMetric'];

interface MetricPickerModalProps {
    visible: boolean;
    current: MetricValue | null;
    onSelect: (metric: MetricValue) => void;
    onClose: () => void;
}

export function MetricPickerModal({visible, current, onSelect, onClose}: MetricPickerModalProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const modalBg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';

    if (!visible) return null;

    return (
        <Modal
            visible={true}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, backgroundColor: modalBg}}>
                <View
                    className="flex-row items-center justify-between border-b border-border px-4"
                    style={{paddingTop: Platform.OS === 'ios' ? 16 : 48, paddingBottom: 12}}
                >
                    <Typography variant="body" className="font-semibold text-foreground">Tracking Metric</Typography>
                    <Pressable onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                    </Pressable>
                </View>

                <Typography variant="caption" className="text-muted-foreground px-4 pt-4 pb-2">
                    Choose what you want to track for this exercise.
                </Typography>

                <View className="px-4 gap-2 pt-2">
                    {METRIC_VALUES.map(metric => {
                        const isSelected = metric === current;
                        return (
                            <Pressable
                                key={metric}
                                onPress={() => { onSelect(metric); onClose(); }}
                                className="flex-row items-center justify-between rounded-xl border px-4 py-4"
                                style={{borderColor: isSelected ? palette.primary : palette.border, backgroundColor: isSelected ? palette.primary + '15' : 'transparent'}}
                            >
                                <Typography variant="body" className="font-medium text-foreground">
                                    {METRIC_LABELS[metric]}
                                </Typography>
                                {isSelected && <Ionicons name="checkmark" size={20} color={palette.primary}/>}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </Modal>
    );
}
