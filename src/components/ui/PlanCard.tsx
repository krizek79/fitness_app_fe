import {View} from 'react-native';
import type {PlanSimpleResponse} from '@/src/api/generated/model';
import {Card} from './Card';
import {Typography} from './Typography';

interface PlanCardProps {
    plan: PlanSimpleResponse;
    onPress?: () => void;
}

export function PlanCard({plan, onPress}: PlanCardProps) {
    const {title, author, trainee, numberOfWeeks, numberOfCompletedWeeks} = plan;

    const completed = numberOfCompletedWeeks ?? 0;
    const total = numberOfWeeks ?? 0;
    const progress = total > 0 ? completed / total : 0;

    return (
        <Card onPress={onPress} padding="md" className="gap-2">
            <Typography variant="body" className="text-foreground font-semibold" numberOfLines={2}>
                {title ?? 'Untitled plan'}
            </Typography>

            <View className="flex-row gap-4">
                {author?.name && (
                    <View className="flex-row items-center gap-1">
                        <Typography variant="caption" className="text-muted-foreground">By</Typography>
                        <Typography variant="caption" className="text-foreground">{author.name}</Typography>
                    </View>
                )}
                {trainee?.name && (
                    <View className="flex-row items-center gap-1">
                        <Typography variant="caption" className="text-muted-foreground">For</Typography>
                        <Typography variant="caption" className="text-foreground">{trainee.name}</Typography>
                    </View>
                )}
            </View>

            {total > 0 && (
                <View className="gap-1">
                    <View className="flex-row justify-between">
                        <Typography variant="caption" className="text-muted-foreground">Progress</Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                            {completed}/{total} weeks
                        </Typography>
                    </View>
                    <View className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <View
                            className="h-full rounded-full bg-primary"
                            style={{width: `${Math.round(progress * 100)}%`}}
                        />
                    </View>
                </View>
            )}
        </Card>
    );
}
