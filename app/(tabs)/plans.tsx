import {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, View} from 'react-native';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useRouter} from 'expo-router';
import {useFilterPlans} from '@/src/api/generated/plan/plan';
import type {PlanSimpleResponse} from '@/src/api/generated/model';
import {PlanCard} from '@/src/components/ui/PlanCard';
import {Skeleton, SkeletonGroup} from '@/src/components/ui/Skeleton';
import {EmptyState} from '@/src/components/ui/EmptyState';
import {SearchInput} from '@/src/components/ui/SearchInput';
import {Typography} from '@/src/components/ui/Typography';
import {themeColors} from '@/src/constants/colors';
import {useDebounce} from '@/src/hooks/useDebounce';
import {planFilterSchema, PLAN_FILTER_DEFAULTS, type PlanFilterFormValues} from '@/src/lib/schemas/planFilter';

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

    const [plans, setPlans] = useState<PlanSimpleResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const isFirstLoad = useRef(true);

    const fetchPage = useCallback((pageNum: number, title: string, sort: string) => {
        mutate(
            {
                data: {
                    page: pageNum,
                    size: PAGE_SIZE,
                    sortBy: 'title',
                    sortDirection: sort,
                    title: title || undefined,
                },
            },
            {
                onSuccess(data) {
                    const results = data.results ?? [];
                    setPlans(prev => pageNum === 0 ? results : [...prev, ...results]);
                    setTotalPages(data.totalPages ?? 1);
                },
            },
        );
    }, [mutate]);

    // Reset and fetch page 0 when filters change
    useEffect(() => {
        setPage(0);
        setPlans([]);
        isFirstLoad.current = true;
        fetchPage(0, debouncedTitle, sortDirection);
    }, [debouncedTitle, sortDirection]);

    // Mark first load done once isPending settles
    useEffect(() => {
        if (!isPending) isFirstLoad.current = false;
    }, [isPending]);

    function loadNextPage() {
        if (isPending) return;
        const nextPage = page + 1;
        if (nextPage >= totalPages) return;
        setPage(nextPage);
        fetchPage(nextPage, debouncedTitle, sortDirection);
    }

    const isInitialLoad = isPending && plans.length === 0;
    const isEmpty = !isPending && plans.length === 0;

    const filterBar = (
        <View className="flex-row items-center gap-2 px-6 py-3">
            <View className="flex-1">
                <SearchInput
                    value={titleValue}
                    onChangeText={text => setValue('title', text)}
                    placeholder="Search plans..."
                />
            </View>
            <Pressable
                onPress={() => setValue('sortDirection', sortDirection === 'ASC' ? 'DESC' : 'ASC')}
                className="flex-row items-center gap-1 rounded-lg border border-input bg-background px-3"
                style={{height: 44}}
                accessibilityRole="button"
                accessibilityLabel={`Sort ${sortDirection === 'ASC' ? 'ascending' : 'descending'}`}
            >
                <Ionicons
                    name={sortDirection === 'ASC' ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={palette.mutedForeground}
                />
                <Typography variant="body-sm" className="text-muted-foreground">
                    {sortDirection === 'ASC' ? 'A–Z' : 'Z–A'}
                </Typography>
            </Pressable>
        </View>
    );

    const fab = (
        <Pressable
            onPress={() => {/* TODO: navigate to create plan screen */}}
            className="absolute bottom-6 right-6 bg-primary rounded-full items-center justify-center shadow-md hover:opacity-90 active:opacity-90"
            style={{width: 56, height: 56}}
            accessibilityRole="button"
            accessibilityLabel="Create new plan"
        >
            <Ionicons name="add" size={28} color="#ffffff"/>
        </Pressable>
    );

    if (isInitialLoad) {
        return (
            <View className="flex-1 bg-background">
                {filterBar}
                <View className="px-6"><PlanListSkeleton/></View>
            </View>
        );
    }

    if (isEmpty) {
        const hasActiveFilter = !!debouncedTitle;
        return (
            <View className="flex-1 bg-background">
                {filterBar}
                <EmptyState
                    icon={<Ionicons name="calendar-outline" size={48} color="#9ca3af"/>}
                    title={hasActiveFilter ? 'No plans found' : 'No plans yet'}
                    description={
                        hasActiveFilter
                            ? `No plans match "${debouncedTitle}". Try a different search.`
                            : 'Your training plans will appear here.'
                    }
                />
                {fab}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <FlatList<PlanSimpleResponse>
                data={plans}
                keyExtractor={item => String(item.id)}
                ListHeaderComponent={filterBar}
                contentContainerStyle={{paddingBottom: 88, gap: 12}}
                renderItem={({item}) => (
                    <View className="px-6">
                        <PlanCard plan={item} onPress={item.id !== undefined ? () => router.push({pathname: '/plan/[id]', params: {id: item.id!}}) : undefined}/>
                    </View>
                )}
                onEndReached={loadNextPage}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    isPending && plans.length > 0 ? (
                        <View className="py-4 items-center">
                            <ActivityIndicator color={palette.primary}/>
                        </View>
                    ) : null
                }
            />
            {fab}
        </View>
    );
}
