import {useCallback, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useForm, useWatch} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useRouter} from 'expo-router';
import {useFilterExercises} from '@/src/api/generated/exercise/exercise';
import type {ExerciseSimpleResponse} from '@/src/api/generated/model';
import {ExerciseCard} from '@/src/components/exercises/ExerciseCard';
import {ExerciseCategoryChips} from '@/src/components/exercises/ExerciseCategoryChips';
import {FilteredList} from '@/src/components/primitives/layout/FilteredList';
import {ReferenceDataChips} from '@/src/components/primitives/form/ReferenceDataChips';
import {EquipmentPickerField} from '@/src/components/equipment/EquipmentPickerField';
import {FilterModal} from '@/src/components/primitives/filter/FilterModal';
import {Fab} from '@/src/components/primitives/ui/Fab';
import {Skeleton, SkeletonGroup} from '@/src/components/primitives/ui/Skeleton';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {SortToggle} from '@/src/components/primitives/filter/SortToggle';
import {WebRefreshButton} from '@/src/components/primitives/filter/WebRefreshButton';
import {useDebounce} from '@/src/hooks/useDebounce';
import {usePaginatedMutation} from '@/src/hooks/usePaginatedMutation';
import {ReferenceDataType} from '@/src/constants/referenceDataTypes';
import {themeColors} from '@/src/constants/colors';
import {
    exerciseFilterSchema,
    EXERCISE_FILTER_DEFAULTS,
    type ExerciseFilterFormValues,
} from '@/src/lib/schemas/exercises/exerciseFilter';

const PAGE_SIZE = 20;

function ExerciseListSkeleton() {
    return (
        <SkeletonGroup gap={12}>
            {Array.from({length: 6}).map((_, i) => (
                <View key={i} className="rounded-lg border border-border bg-card p-4 gap-3">
                    <Skeleton height={18} width="65%" rounded="md"/>
                    <Skeleton height={20} width="28%" rounded="full"/>
                    <Skeleton height={13} width="50%" rounded="md"/>
                </View>
            ))}
        </SkeletonGroup>
    );
}

export default function ExercisesScreen() {
    const router = useRouter();
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    const {control, setValue} = useForm<ExerciseFilterFormValues>({
        resolver: zodResolver(exerciseFilterSchema),
        defaultValues: EXERCISE_FILTER_DEFAULTS,
    });

    const titleValue = useWatch({control, name: 'title'}) ?? '';
    const sortDirection = useWatch({control, name: 'sortDirection'});
    const exerciseCategory = useWatch({control, name: 'exerciseCategory'});
    const movementPatterns = useWatch({control, name: 'movementPatterns'}) ?? [];
    const muscles = useWatch({control, name: 'muscles'}) ?? [];
    const requiredEquipmentIds = useWatch({control, name: 'requiredEquipmentIds'}) ?? [];
    const debouncedTitle = useDebounce(titleValue, 400);

    // Draft state — only committed to form (and thus the API) when Done is pressed
    const [draftMovementPatterns, setDraftMovementPatterns] = useState<NonNullable<ExerciseFilterFormValues['movementPatterns']>>([]);
    const [draftMuscles, setDraftMuscles] = useState<NonNullable<ExerciseFilterFormValues['muscles']>>([]);
    const [draftEquipmentIds, setDraftEquipmentIds] = useState<number[]>([]);

    function openFilterModal() {
        setDraftMovementPatterns([...movementPatterns]);
        setDraftMuscles([...muscles]);
        setDraftEquipmentIds([...requiredEquipmentIds]);
        setFilterModalOpen(true);
    }

    function applyFilters() {
        setValue('movementPatterns', draftMovementPatterns);
        setValue('muscles', draftMuscles);
        setValue('requiredEquipmentIds', draftEquipmentIds);
        setFilterModalOpen(false);
    }

    const {mutate, isPending} = useFilterExercises();

    const {items: exercises, isRefreshing, refresh, loadNextPage, isInitialLoad} =
        usePaginatedMutation<ExerciseSimpleResponse>({
            fetch: useCallback((page, onSuccess, onSettled) =>
                mutate(
                    {
                        data: {
                            page,
                            size: PAGE_SIZE,
                            sortBy: 'title',
                            sortDirection,
                            title: debouncedTitle || undefined,
                            exerciseCategory: exerciseCategory ?? undefined,
                            movementPatterns: movementPatterns.length > 0 ? movementPatterns : undefined,
                            muscles: muscles.length > 0 ? muscles : undefined,
                            requiredEquipmentIds: requiredEquipmentIds.length > 0 ? requiredEquipmentIds : undefined,
                        },
                    },
                    {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
                ),
            [mutate, sortDirection, debouncedTitle, exerciseCategory, movementPatterns, muscles, requiredEquipmentIds]),
            isPending,
            filterDeps: [debouncedTitle, sortDirection, exerciseCategory, movementPatterns, muscles, requiredEquipmentIds],
        });

    const hasActiveFilter = !!debouncedTitle || !!exerciseCategory
        || movementPatterns.length > 0 || muscles.length > 0 || requiredEquipmentIds.length > 0;
    const hasAdvancedFilter = movementPatterns.length > 0 || muscles.length > 0 || requiredEquipmentIds.length > 0;

    function toggleDraftMovementPattern(key: string) {
        const k = key as NonNullable<ExerciseFilterFormValues['movementPatterns']>[number];
        setDraftMovementPatterns(prev => prev.includes(k) ? prev.filter(p => p !== k) : [...prev, k]);
    }

    function toggleDraftMuscle(key: string) {
        const k = key as NonNullable<ExerciseFilterFormValues['muscles']>[number];
        setDraftMuscles(prev => prev.includes(k) ? prev.filter(m => m !== k) : [...prev, k]);
    }

    const filterBar = (
        <View className="pb-3">
            <View className="flex-row items-center gap-2 px-6 py-3">
                <View className="flex-1">
                    <SearchInput
                        value={titleValue}
                        onChangeText={text => setValue('title', text)}
                        placeholder="Search exercises..."
                    />
                </View>
                <Pressable
                    onPress={openFilterModal}
                    style={{padding: 8}}
                    accessibilityLabel="Open filters"
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color={hasAdvancedFilter ? palette.primary : palette.mutedForeground}
                    />
                </Pressable>
                <SortToggle
                    direction={sortDirection}
                    onToggle={() => setValue('sortDirection', sortDirection === 'ASC' ? 'DESC' : 'ASC')}
                />
                <WebRefreshButton onRefresh={refresh} isRefreshing={isRefreshing}/>
            </View>
            <ExerciseCategoryChips
                selected={exerciseCategory}
                onSelect={category => setValue('exerciseCategory', category)}
            />
            <FilterModal
                visible={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApply={applyFilters}
            >
                <ReferenceDataChips
                    label="Movement Patterns"
                    type={ReferenceDataType.MOVEMENT_PATTERNS}
                    selected={draftMovementPatterns}
                    onToggle={toggleDraftMovementPattern}
                />
                <ReferenceDataChips
                    label="Muscles"
                    type={ReferenceDataType.MUSCLES}
                    selected={draftMuscles}
                    onToggle={toggleDraftMuscle}
                />
                <EquipmentPickerField
                    label="Equipment"
                    value={draftEquipmentIds}
                    onChange={setDraftEquipmentIds}
                />
            </FilterModal>
        </View>
    );

    return (
        <FilteredList<ExerciseSimpleResponse>
            data={exercises}
            renderItem={({item}) => (
                <View className="px-6">
                    <ExerciseCard
                        exercise={item}
                        onPress={item.id !== undefined
                            ? () => router.push({pathname: '/exercise/[id]', params: {id: item.id!}})
                            : undefined
                        }
                    />
                </View>
            )}
            keyExtractor={item => String(item.id)}
            filterBar={filterBar}
            skeleton={<View className="px-6"><ExerciseListSkeleton/></View>}
            emptyIcon={<Ionicons name="barbell-outline" size={48} color="#9ca3af"/>}
            emptyTitle={hasActiveFilter ? 'No exercises found' : 'No exercises yet'}
            emptyDescription={
                hasActiveFilter
                    ? 'Try adjusting your search or filters.'
                    : 'Exercises will appear here once added.'
            }
            isInitialLoad={isInitialLoad}
            isPending={isPending}
            isRefreshing={isRefreshing}
            onRefresh={refresh}
            onEndReached={loadNextPage}
            fab={<Fab onPress={() => router.push('/exercise/create')} accessibilityLabel="Create new exercise"/>}
        />
    );
}
