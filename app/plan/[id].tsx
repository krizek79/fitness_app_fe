import {Alert, Platform, Pressable, RefreshControl, ScrollView, View} from 'react-native';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useGetPlanById, useDeletePlan} from '@/src/api/generated/plan/plan';
import {Heading, Typography} from '@/src/components/primitives/ui/Typography';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {WeekCard} from '@/src/components/week/WeekCard';
import {DetailLayout, webContentStyle} from '@/src/components/primitives/layout/DetailLayout';
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

export default function PlanDetailScreen() {
    const {id} = useLocalSearchParams<{id: string}>();
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {data: plan, isLoading, refetch, isRefetching} = useGetPlanById(Number(id));
    const {mutate: deletePlan, isPending: isDeleting} = useDeletePlan();

    function handleDelete() {
        const message = `Are you sure you want to delete "${plan?.title ?? 'this plan'}"? This cannot be undone.`;
        if (Platform.OS === 'web') {
            if (window.confirm(message)) {
                deletePlan({id: Number(id)}, {onSuccess: () => router.replace('/(tabs)/plans')});
            }
            return;
        }
        Alert.alert('Delete plan', message, [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deletePlan(
                    {id: Number(id)},
                    {onSuccess: () => router.replace('/(tabs)/plans')},
                ),
            },
        ]);
    }

    const headerRight = !isLoading && (
        <View className="flex-row items-center" style={{gap: 24}}>
            <Pressable
                onPress={() => router.push({pathname: '/plan/edit/[id]', params: {id}})}
                accessibilityLabel="Edit plan"
                style={{padding: 8}}
            >
                <Ionicons name="pencil-outline" size={20} color={palette.mutedForeground}/>
            </Pressable>
            <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityLabel="Delete plan"
                style={{padding: 8, opacity: isDeleting ? 0.4 : 1}}
            >
                <Ionicons name="trash-outline" size={20} color={palette.destructive}/>
            </Pressable>
        </View>
    );

    return (
        <DetailLayout
            title={isLoading ? 'Loading…' : (plan?.title ?? 'Plan')}
            headerRight={headerRight || undefined}
        >
            <ScrollView
                contentContainerStyle={{padding: 24, gap: 16, ...webContentStyle}}
                refreshControl={Platform.OS !== 'web' ? (
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary}/>
                ) : undefined}
            >
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
                                    <WeekCard
                                        key={week.id}
                                        week={week}
                                        onPress={() => router.push({pathname: '/week/[id]', params: {id: week.id!}})}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </DetailLayout>
    );
}
