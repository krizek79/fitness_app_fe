import {View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {WeekSimpleResponse} from '@/src/api/generated/model';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Card} from '@/src/components/primitives/ui/Card';
import {Badge} from '@/src/components/primitives/ui/Badge';

interface WeekCardProps {
    week: WeekSimpleResponse;
    onPress?: () => void;
}

export function WeekCard({week, onPress}: WeekCardProps) {
    const completedWorkouts = week.numberOfCompletedWorkouts ?? 0;
    const totalWorkouts = week.numberOfWorkouts ?? 0;
    const progress = totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0;
    const progressPercent = Math.round(progress * 100);
    const hasWorkouts = totalWorkouts > 0;
    const isCompleted = week.completed ?? false;
    const isInProgress = !isCompleted && completedWorkouts > 0;

    return (
        <Card padding="md" className="gap-3" onPress={onPress}>
            {/* Header row */}
            <View className="flex-row items-center justify-between">
                <Typography variant="body" className="text-foreground font-semibold">
                    Week {week.order}
                </Typography>

                <View className="flex-row items-center gap-2">
                    {isCompleted && <Badge label="Completed" variant="success"/>}
                    {isInProgress && <Badge label="In progress" variant="warning"/>}
                    {!isCompleted && !isInProgress && hasWorkouts && <Badge label="Not started" variant="muted"/>}
                    <Ionicons name="chevron-forward" size={16} color="#6b7280"/>
                </View>
            </View>

            {/* Workout stats */}
            {hasWorkouts && (
                <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="barbell-outline" size={13} color="#6b7280"/>
                            <Typography variant="caption" className="text-muted-foreground">
                                Workouts
                            </Typography>
                        </View>
                        <Typography variant="caption" className="text-foreground font-medium">
                            {completedWorkouts} / {totalWorkouts}
                        </Typography>
                    </View>

                    {/* Progress bar */}
                    <View className="h-2 rounded-full bg-muted overflow-hidden">
                        <View
                            className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                            style={{width: `${progressPercent}%`}}
                        />
                    </View>

                    <Typography variant="caption" className="text-muted-foreground text-right">
                        {progressPercent}% complete
                    </Typography>
                </View>
            )}

            {!hasWorkouts && (
                <Typography variant="caption" className="text-muted-foreground">
                    No workouts yet
                </Typography>
            )}
        </Card>
    );
}
