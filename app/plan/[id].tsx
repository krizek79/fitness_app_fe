import {View, ScrollView} from 'react-native';
import {useLocalSearchParams} from 'expo-router';
import {Stack} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useGetPlanById} from '@/src/api/generated/plan/plan';
import type {WeekSimpleResponse} from '@/src/api/generated/model';
import {Heading, Typography} from '@/src/components/ui/Typography';
import {Skeleton, SkeletonGroup} from '@/src/components/ui/Skeleton';
import {Card} from '@/src/components/ui/Card';
import {themeColors} from '@/src/constants/colors';

function PlanDetailSkeleton() {
    return (
        <SkeletonGroup gap={16}>
            <Skeleton height={28} width="60%" rounded="md"/>
            <Skeleton height={16} width="40%" rounded="md"/>
            <Skeleton height={60} width="100%" rounded="md"/>
            {Array.from({length: 4}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <Skeleton height={16} width="30%" rounded="md"/>
                    <Skeleton height={8} width="100%" rounded="full"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

function WeekCard({week}: {week: WeekSimpleResponse}) {
    const completedWorkouts = week.numberOfCompletedWorkouts ?? 0;
    const totalWorkouts = week.numberOfWorkouts ?? 0;
    const progress = totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0;

    return (
        <Card padding="md" className="gap-2">
            <View className="flex-row items-center justify-between">
                <Typography variant="body" className="text-foreground font-medium">
                    Week {week.order}
                </Typography>
                {week.completed && (
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="checkmark-circle" size={16} color="#22c55e"/>
                        <Typography variant="caption" className="text-green-500">Completed</Typography>
                    </View>
                )}
            </View>

            {totalWorkouts > 0 && (
                <View className="gap-1">
                    <View className="flex-row justify-between">
                        <Typography variant="caption" className="text-muted-foreground">Workouts</Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                            {completedWorkouts}/{totalWorkouts}
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

export default function PlanDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: plan, isLoading} = useGetPlanById(Number(id));

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{
                headerShown: true,
                title: isLoading ? 'Loading…' : (plan?.title ?? 'Plan'),
                headerStyle: {backgroundColor: palette.card},
                headerTintColor: palette.mutedForeground,
                headerShadowVisible: false,
            }}/>

            <ScrollView contentContainerStyle={{padding: 24, gap: 16}}>
                {isLoading ? (
                    <PlanDetailSkeleton/>
                ) : (
                    <>
                        {/* Meta */}
                        <View className="gap-4">
                            <View className="flex-row gap-3">
                                {plan?.author?.name && (
                                    <View className="flex-row items-center gap-1">
                                        <Typography variant="caption" className="text-muted-foreground">By</Typography>
                                        <Typography variant="caption" className="text-foreground">{plan.author.name}</Typography>
                                    </View>
                                )}
                                {plan?.trainee?.name && (
                                    <View className="flex-row items-center gap-1">
                                        <Typography variant="caption" className="text-muted-foreground">For</Typography>
                                        <Typography variant="caption" className="text-foreground">{plan.trainee.name}</Typography>
                                    </View>
                                )}
                            </View>

                            {plan?.description && (
                                <View className="gap-1 mt-1">
                                    <Heading level="h5">Description</Heading>
                                    <Typography variant="body-sm" className="text-muted-foreground">
                                        {plan.description}
                                    </Typography>
                                </View>
                            )}
                        </View>

                        {/* Weeks */}
                        {(plan?.weeks ?? []).length > 0 && (
                            <View className="gap-3">
                                <Heading level="h5">Weeks</Heading>
                                {plan!.weeks!.map(week => (
                                    <WeekCard key={week.id} week={week}/>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
