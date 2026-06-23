import {useEffect, useRef, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useFilterTags} from '@/src/api/generated/tag/tag';
import type {TagPageResponse, TagResponse} from '@/src/api/generated/model';
import {themeColors} from '@/src/constants/colors';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {SortToggle} from '@/src/components/primitives/filter/SortToggle';
import {WebRefreshButton} from '@/src/components/primitives/filter/WebRefreshButton';
import {FilterModal} from '@/src/components/primitives/filter/FilterModal';
import {Typography} from '@/src/components/primitives/ui/Typography';
import type {WorkoutFilterFormValues} from '@/src/lib/schemas/workouts/workoutFilter';

const TAG_PAGE_SIZE = 20;

interface WorkoutFilterBarProps {
    values: WorkoutFilterFormValues;
    onTitleChange: (title: string) => void;
    onSortToggle: () => void;
    onTagsChange: (tagIdList: number[]) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
}

export function WorkoutFilterBar({
    values,
    onTitleChange,
    onSortToggle,
    onTagsChange,
    onRefresh,
    isRefreshing,
}: WorkoutFilterBarProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const [modalVisible, setModalVisible] = useState(false);
    const [pendingTagIds, setPendingTagIds] = useState<number[]>(values.tagIdList);
    // Selected tag objects — kept so we can display names for selected IDs
    const [selectedTags, setSelectedTags] = useState<TagResponse[]>([]);

    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchResults, setSearchResults] = useState<TagResponse[]>([]);
    const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const {mutate: fetchTags, isPending: isSearching} = useFilterTags();

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedSearch(searchText), 300);
        return () => clearTimeout(debounceTimer.current);
    }, [searchText]);

    useEffect(() => {
        if (!modalVisible) return;
        fetchTags(
            {data: {page: 0, size: TAG_PAGE_SIZE, sortBy: 'name', sortDirection: 'ASC', name: debouncedSearch || undefined}},
            {onSuccess: (d: TagPageResponse) => setSearchResults(d.results ?? [])},
        );
    }, [debouncedSearch, modalVisible]);

    function openModal() {
        setPendingTagIds(values.tagIdList);
        setSearchText('');
        setDebouncedSearch('');
        setSearchResults([]);
        setModalVisible(true);
    }

    function handleApply() {
        onTagsChange(pendingTagIds);
        setModalVisible(false);
    }

    function handleClose() {
        setModalVisible(false);
    }

    function toggleTag(tag: TagResponse) {
        const id = tag.id!;
        setPendingTagIds(prev => {
            if (prev.includes(id)) {
                setSelectedTags(s => s.filter(t => t.id !== id));
                return prev.filter(t => t !== id);
            } else {
                setSelectedTags(s => s.some(t => t.id === id) ? s : [...s, tag]);
                return [...prev, id];
            }
        });
    }

    const activeFilterCount = values.tagIdList.length;

    // Results excluding already-selected (shown separately above)
    const unselectedResults = searchResults.filter(t => !pendingTagIds.includes(t.id!));

    return (
        <>
            <View className="flex-row items-center gap-2 px-6 py-3">
                <View className="flex-1">
                    <SearchInput
                        value={values.title}
                        onChangeText={onTitleChange}
                        placeholder="Search workouts..."
                    />
                </View>
                <SortToggle
                    direction={values.sortDirection}
                    onToggle={onSortToggle}
                />
                <Pressable
                    onPress={openModal}
                    hitSlop={8}
                    className="relative items-center justify-center"
                    style={{width: 36, height: 36}}
                >
                    <Ionicons name="options-outline" size={22} color={activeFilterCount > 0 ? palette.primary : palette.mutedForeground}/>
                    {activeFilterCount > 0 && (
                        <View
                            className="absolute top-0 right-0 bg-primary rounded-full items-center justify-center"
                            style={{width: 16, height: 16}}
                        >
                            <Typography variant="caption" className="text-primary-foreground" style={{fontSize: 9, lineHeight: 16}}>
                                {activeFilterCount}
                            </Typography>
                        </View>
                    )}
                </Pressable>
                <WebRefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing}/>
            </View>

            <FilterModal
                visible={modalVisible}
                title="Filter workouts"
                onClose={handleClose}
                onApply={handleApply}
            >
                <View className="gap-4">
                    <Typography variant="body-sm" className="font-medium text-foreground">Tags</Typography>

                    {/* Search input */}
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search tags..."
                        placeholderTextColor={palette.mutedForeground}
                        className="rounded-md border border-input bg-background px-3 text-base text-foreground"
                        style={{height: 40}}
                        autoCorrect={false}
                    />

                    {/* Selected tags */}
                    {pendingTagIds.length > 0 && (
                        <View className="gap-2">
                            <Typography variant="caption" className="text-muted-foreground">Selected</Typography>
                            <View className="flex-row flex-wrap gap-2">
                                {selectedTags.filter(t => pendingTagIds.includes(t.id!)).map(tag => (
                                    <Pressable
                                        key={tag.id}
                                        onPress={() => toggleTag(tag)}
                                        className="flex-row items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1.5"
                                    >
                                        <Typography variant="caption" className="font-medium text-primary-foreground">
                                            {tag.name}
                                        </Typography>
                                        <Ionicons name="close" size={12} color={palette.foreground}/>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Search results */}
                    {isSearching ? (
                        <Typography variant="caption" className="text-muted-foreground">Searching...</Typography>
                    ) : unselectedResults.length > 0 ? (
                        <View className="flex-row flex-wrap gap-2">
                            {unselectedResults.map(tag => (
                                <Pressable
                                    key={tag.id}
                                    onPress={() => toggleTag(tag)}
                                    className="rounded-full border border-border bg-transparent px-3 py-1.5"
                                >
                                    <Typography variant="caption" className="font-medium text-muted-foreground">
                                        {tag.name}
                                    </Typography>
                                </Pressable>
                            ))}
                        </View>
                    ) : debouncedSearch.length > 0 ? (
                        <Typography variant="caption" className="text-muted-foreground">No tags found</Typography>
                    ) : null}
                </View>
            </FilterModal>
        </>
    );
}
