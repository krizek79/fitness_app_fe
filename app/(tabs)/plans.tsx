import {useCallback} from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, View} from 'react-native';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useRouter} from 'expo-router';
import {useFilterPlans} from '@/src/api/generated/plan/plan';
import type {PlanSimpleResponse} from '@/src/api/generated/model';
import {PlanCard} from '@/src/components/plans/PlanCard';
import {CreatePlanFab} from '@/src/components/plans/CreatePlanFab';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/Skeleton';
import {EmptyState} from '@/src/components/primitives/EmptyState';
import {SearchInput} from '@/src/components/primitives/SearchInput';
import {SortToggle} from '@/src/components/primitives/SortToggle';
import {WebRefreshButton} from '@/src/components/primitives/WebRefreshButton';
import {themeColors} from '@/src/constants/colors';
import {useDebounce} from '@/src/hooks/useDebounce';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';
import {planFilterSchema, PLAN_FILTER_DEFAULTS, type PlanFilterFormValues} from '@/src/lib/schemas/plans/planFilter';

const PAGE_SIZE = 20;

function PlanListSkeleton() {
    return (
        <SkeletonGroup gap={12}>
            {Array.from({length: 5}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <Skeleton height={18} width="70%" rounded="md"/>
                    <Skeleton height={13} width="45%" rounded="md"/>
                    <Skeleton height={6} width="100%" rounded="full"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

export default function PlansScreen() {
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const {control, setValue} = useForm<PlanFilterFormValues>({
        resolver: zodResolver(planFilterSchema),
        defaultValues: PLAN_FILTER_DEFAULTS,
    });

    const titleValue = useWatch({control, name: 'title'}) ?? '';
    const sortDirection = useWatch({control, name: 'sortDirection'});
    const debouncedTitle = useDebounce(titleValue, 400);

    const {mutate, isPending} = useFilterPlans();

    const {items: plans, isRefreshing, refresh, loadNextPage, isInitialLoad} =
        usePaginatedMutation<PlanSimpleResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                mutate(
                    {data: {page, size: PAGE_SIZE, sortBy: 'title', sortDirection, title: debouncedTitle || undefined}},
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [mutate, sortDirection, debouncedTitle]),
            isPending,
            filterDeps: [debouncedTitle, sortDirection],
        });

    const filterBar = (
        <View className="flex-row items-center gap-2 px-6 py-3">
            <View className="flex-1">
                <SearchInput
                    value={titleValue}
                    onChangeText={text => setValue('title', text)}
                    placeholder="Search plans..."
                />
            </View>
            <SortToggle
                direction={sortDirection}
                onToggle={() => setValue('sortDirection', sortDirection === 'ASC' ? 'DESC' : 'ASC')}
            />
            <WebRefreshButton onRefresh={refresh} isRefreshing={isRefreshing}/>
        </View>
    );

    const refreshControl = Platform.OS !== 'web' ? (
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={palette.primary}/>
    ) : undefined;

    const hasActiveFilter = !!debouncedTitle;

    return (
        <View className="flex-1 bg-background">
            {/* filterBar is always mounted here so the search input never loses focus on re-renders */}
            {filterBar}

            <FlatList<PlanSimpleResponse>
                data={plans}
                keyExtractor={item => String(item.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingBottom: 88, gap: 12, flexGrow: 1}}
                renderItem={({item}) => (
                    <View className="px-6">
                        <PlanCard
                            plan={item}
                            onPress={item.id !== undefined ? () => router.push({pathname: '/plan/[id]', params: {id: item.id!}}) : undefined}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    isInitialLoad ? (
                        <View className="px-6"><PlanListSkeleton/></View>
                    ) : (
                        <EmptyState
                            icon={<Ionicons name="calendar-outline" size={48} color="#9ca3af"/>}
                            title={hasActiveFilter ? 'No plans found' : 'No plans yet'}
                            description={
                                hasActiveFilter
                                    ? `No plans match "${debouncedTitle}". Try a different search.`
                                    : 'Your training plans will appear here.'
                            }
                        />
                    )
                }
                onEndReached={loadNextPage}
                onEndReachedThreshold={0.3}
                refreshControl={refreshControl}
                ListFooterComponent={
                    isPending && plans.length > 0 ? (
                        <View className="py-4 items-center">
                            <ActivityIndicator color={palette.primary}/>
                        </View>
                    ) : null
                }
            />

            <CreatePlanFab onPress={() => router.push('/plan/create')}/>
        </View>
    );
}
