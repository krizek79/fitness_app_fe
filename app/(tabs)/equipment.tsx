import {useCallback} from 'react';
import {View} from 'react-native';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useFilterEquipment} from '@/src/api/generated/equipment/equipment';
import type {EquipmentResponse} from '@/src/api/generated/model';
import {EquipmentCard} from '@/src/components/equipment/EquipmentCard';
import {FilteredList} from '@/src/components/primitives/layout/FilteredList';
import {Fab} from '@/src/components/primitives/ui/Fab';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {SortToggle} from '@/src/components/primitives/filter/SortToggle';
import {WebRefreshButton} from '@/src/components/primitives/filter/WebRefreshButton';
import {useDebounce} from '@/src/hooks/useDebounce';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';
import {
    equipmentFilterSchema,
    EQUIPMENT_FILTER_DEFAULTS,
    type EquipmentFilterFormValues,
} from '@/src/lib/schemas/equipment/equipmentFilter';

const PAGE_SIZE = 20;

function EquipmentListSkeleton() {
    return (
        <SkeletonGroup gap={12}>
            {Array.from({length: 6}).map((_, i) => (
                <View key={i} className="flex-row rounded-lg border border-border bg-card overflow-hidden" style={{height: 72}}>
                    <Skeleton height={72} width={72}/>
                    <View className="flex-1 justify-center px-4">
                        <Skeleton height={18} width="60%" rounded="md"/>
                    </View>
                </View>
            ))}
        </SkeletonGroup>
    );
}

export default function EquipmentScreen() {
    const router = useRouter();

    const {control, setValue} = useForm<EquipmentFilterFormValues>({
        resolver: zodResolver(equipmentFilterSchema),
        defaultValues: EQUIPMENT_FILTER_DEFAULTS,
    });

    const titleValue = useWatch({control, name: 'title'}) ?? '';
    const sortDirection = useWatch({control, name: 'sortDirection'});
    const debouncedTitle = useDebounce(titleValue, 400);

    const {mutate, isPending} = useFilterEquipment();

    const {items: equipment, isRefreshing, refresh, loadNextPage, isInitialLoad} =
        usePaginatedMutation<EquipmentResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                mutate(
                    {
                        data: {
                            page,
                            size: PAGE_SIZE,
                            sortBy: 'title',
                            sortDirection,
                            title: debouncedTitle || undefined,
                        },
                    },
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [mutate, sortDirection, debouncedTitle]),
            isPending,
            filterDeps: [debouncedTitle, sortDirection],
        });

    const hasActiveFilter = !!debouncedTitle;

    const filterBar = (
        <View className="flex-row items-center gap-2 px-6 py-3">
            <View className="flex-1">
                <SearchInput
                    value={titleValue}
                    onChangeText={text => setValue('title', text)}
                    placeholder="Search equipment..."
                />
            </View>
            <SortToggle
                direction={sortDirection}
                onToggle={() => setValue('sortDirection', sortDirection === 'ASC' ? 'DESC' : 'ASC')}
            />
            <WebRefreshButton onRefresh={refresh} isRefreshing={isRefreshing}/>
        </View>
    );

    return (
        <FilteredList<EquipmentResponse>
            data={equipment}
            renderItem={({item}) => (
                <View className="px-6">
                    <EquipmentCard
                        equipment={item}
                        onPress={item.id !== undefined
                            ? () => router.push({pathname: '/equipment/[id]', params: {id: item.id!}})
                            : undefined
                        }
                    />
                </View>
            )}
            keyExtractor={item => String(item.id)}
            filterBar={filterBar}
            skeleton={<View className="px-6"><EquipmentListSkeleton/></View>}
            emptyIcon={<Ionicons name="cube-outline" size={48} color="#9ca3af"/>}
            emptyTitle={hasActiveFilter ? 'No equipment found' : 'No equipment yet'}
            emptyDescription={
                hasActiveFilter
                    ? 'Try adjusting your search.'
                    : 'Equipment will appear here once added.'
            }
            isInitialLoad={isInitialLoad}
            isPending={isPending}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            onEndReached={loadNextPage}
            fab={<Fab onPress={() => router.push('/equipment/create')} accessibilityLabel="Create new equipment"/>}
        />
    );
}
