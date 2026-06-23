import {View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {WorkoutSimpleResponse} from '@/src/api/generated/model';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Card} from '@/src/components/primitives/ui/Card';
import {Badge} from '@/src/components/primitives/ui/Badge';

interface WorkoutCardProps {
    workout: WorkoutSimpleResponse;
    onPress?: () => void;
}

export function WorkoutCard({workout, onPress}: WorkoutCardProps) {
    const tags = workout.tags ?? [];
    const hasMeta = !!(workout.author?.name || workout.trainee?.name);

    return (
        <Card padding="md" className="gap-2" onPress={onPress}>
            <View className="flex-row items-center justify-between">
                <Typography variant="body" className="text-foreground font-semibold flex-1 mr-2">
                    {workout.title ?? 'Untitled workout'}
                </Typography>
                <Ionicons name="chevron-forward" size={16} color="#6b7280"/>
            </View>

            {hasMeta && (
                <View className="flex-row gap-3">
                    {workout.author?.name && (
                        <View className="flex-row items-center gap-1">
                            <Typography variant="caption" className="text-muted-foreground">By</Typography>
                            <Typography variant="caption" className="text-foreground">{workout.author.name}</Typography>
                        </View>
                    )}
                    {workout.trainee?.name && (
                        <View className="flex-row items-center gap-1">
                            <Typography variant="caption" className="text-muted-foreground">For</Typography>
                            <Typography variant="caption" className="text-foreground">{workout.trainee.name}</Typography>
                        </View>
                    )}
                </View>
            )}

            {tags.length > 0 && (
                <View className="flex-row flex-wrap gap-1">
                    {tags.map(tag => (
                        <Badge key={tag.id} label={tag.name ?? ''} variant="muted"/>
                    ))}
                </View>
            )}
        </Card>
    );
}
