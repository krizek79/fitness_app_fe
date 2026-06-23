import {useCallback} from 'react';
import {View, ViewStyle} from 'react-native';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useFilterWorkouts} from '@/src/api/generated/workout/workout';
import type {WorkoutSimpleResponse} from '@/src/api/generated/model';
import {FilteredList} from '@/src/components/primitives/layout/FilteredList';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {WorkoutCard} from './WorkoutCard';
import {WorkoutFilterBar} from './WorkoutFilterBar';
import {workoutFilterSchema, WORKOUT_FILTER_DEFAULTS, type WorkoutFilterFormValues} from '@/src/lib/schemas/workouts/workoutFilter';
import {useDebounce} from '@/src/hooks/useDebounce';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';

const PAGE_SIZE = 20;

function WorkoutListSkeleton() {
    return (
        <SkeletonGroup gap={12}>
            {Array.from({length: 5}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <Skeleton height={18} width="65%" rounded="md"/>
                    <Skeleton height={13} width="40%" rounded="md"/>
                    <View className="flex-row gap-2">
                        <Skeleton height={22} width={60} rounded="full"/>
                        <Skeleton height={22} width={72} rounded="full"/>
                    </View>
                </View>
            ))}
        </SkeletonGroup>
    );
}

interface WorkoutListProps {
    isTemplate: boolean;
    isQuick: boolean;
    onPress: (id: number) => void;
    fab: React.ReactNode;
    style?: ViewStyle;
}

export function WorkoutList({isTemplate, isQuick, onPress, fab, style}: WorkoutListProps) {
    const {control, setValue} = useForm<WorkoutFilterFormValues>({
        resolver: zodResolver(workoutFilterSchema),
        defaultValues: WORKOUT_FILTER_DEFAULTS,
    });

    const titleValue = useWatch({control, name: 'title'}) ?? '';
    const sortDirection = useWatch({control, name: 'sortDirection'});
    const tagIdList = useWatch({control, name: 'tagIdList'});
    const debouncedTitle = useDebounce(titleValue, 400);

    const {mutate, isPending} = useFilterWorkouts();

    const {items: workouts, isRefreshing, refresh, loadNextPage, isInitialLoad} =
        usePaginatedMutation<WorkoutSimpleResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                mutate(
                    {
                        data: {
                            page,
                            size: PAGE_SIZE,
                            sortBy: 'title',
                            sortDirection,
                            title: debouncedTitle || undefined,
                            tagIdList: tagIdList.length > 0 ? tagIdList : undefined,
                            isTemplate,
                            isQuick,
                        },
                    },
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [mutate, sortDirection, debouncedTitle, tagIdList, isTemplate, isQuick]),
            isPending,
            filterDeps: [debouncedTitle, sortDirection, tagIdList, isTemplate, isQuick],
        });

    const hasActiveFilter = !!debouncedTitle || tagIdList.length > 0;

    const filterBar = (
        <WorkoutFilterBar
            values={{title: titleValue, sortDirection, tagIdList}}
            onTitleChange={text => setValue('title', text)}
            onSortToggle={() => setValue('sortDirection', sortDirection === 'ASC' ? 'DESC' : 'ASC')}
            onTagsChange={ids => setValue('tagIdList', ids)}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
        />
    );

    const label = isTemplate ? 'template' : 'quick workout';

    return (
        <View style={[{flex: 1}, style]}>
            <FilteredList<WorkoutSimpleResponse>
                data={workouts}
                renderItem={({item}) => (
                    <View className="px-6">
                        <WorkoutCard
                            workout={item}
                            onPress={item.id !== undefined ? () => onPress(item.id!) : undefined}
                        />
                    </View>
                )}
                keyExtractor={item => String(item.id)}
                filterBar={filterBar}
                skeleton={<View className="px-6"><WorkoutListSkeleton/></View>}
                emptyIcon={<Ionicons name="fitness-outline" size={48} color="#9ca3af"/>}
                emptyTitle={hasActiveFilter ? 'No workouts found' : `No ${label}s yet`}
                emptyDescription={
                    hasActiveFilter
                        ? 'Try adjusting your search or filters.'
                        : `Your ${label}s will appear here.`
                }
                isInitialLoad={isInitialLoad}
                isPending={isPending}
                isRefreshing={isRefreshing}
                onRefresh={refresh}
                onEndReached={loadNextPage}
                fab={fab}
            />
        </View>
    );
}
