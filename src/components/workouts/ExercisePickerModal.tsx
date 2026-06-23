import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, Modal, Platform, Pressable, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useFilterExercises} from '@/src/api/generated/exercise/exercise';
import type {ExerciseSimpleResponse} from '@/src/api/generated/model';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {Button} from '@/src/components/primitives/ui/Button';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';
import {useDebounce} from '@/src/hooks/useDebounce';

const PAGE_SIZE = 20;

interface ExercisePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (exercise: ExerciseSimpleResponse) => void;
}

export function ExercisePickerModal({visible, onClose, onSelect}: ExercisePickerModalProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const modalBg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [items, setItems] = useState<ExerciseSimpleResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const {mutate, isPending} = useFilterExercises();

    const fetchPage = useCallback((pageNum: number, title: string) => {
        mutate(
            {data: {page: pageNum, size: PAGE_SIZE, sortBy: 'title', sortDirection: 'ASC', title: title || undefined}},
            {
                onSuccess(data) {
                    const results = data.results ?? [];
                    setItems(prev => pageNum === 0 ? results : [...prev, ...results]);
                    setTotalPages(data.totalPages ?? 1);
                    setPage(pageNum);
                },
            },
        );
    }, [mutate]);

    useEffect(() => {
        if (!visible) return;
        setItems([]);
        setPage(0);
        fetchPage(0, debouncedSearch);
    }, [debouncedSearch, visible, fetchPage]);

    useEffect(() => {
        if (visible) {
            setSearch('');
            setItems([]);
            setPage(0);
        }
    }, [visible]);

    function handleSelect(exercise: ExerciseSimpleResponse) {
        onSelect(exercise);
        onClose();
    }

    function loadNextPage() {
        if (isPending || page + 1 >= totalPages) return;
        fetchPage(page + 1, debouncedSearch);
    }

    if (!visible) return null;

    return (
        <Modal
            visible={true}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, backgroundColor: modalBg}}>
                <View
                    className="flex-row items-center justify-between border-b border-border px-4"
                    style={{paddingTop: Platform.OS === 'ios' ? 16 : 48, paddingBottom: 12}}
                >
                    <Typography variant="body" className="font-semibold text-foreground">Add Exercise</Typography>
                    <Pressable onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                    </Pressable>
                </View>

                <View className="px-4 py-3">
                    <SearchInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search exercises..."
                        autoFocus
                    />
                </View>

                <FlatList
                    data={items}
                    keyExtractor={item => String(item.id)}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => handleSelect(item)}
                            className="flex-row items-center gap-3 px-4 border-b border-border"
                            style={{paddingVertical: 10}}
                        >
                            <View
                                className="rounded-md bg-muted items-center justify-center overflow-hidden"
                                style={{width: 48, height: 48}}
                            >
                                {item.thumbnailUrl ? (
                                    Platform.OS === 'web' ? (
                                        // @ts-ignore
                                        <img src={item.thumbnailUrl} style={{width: 48, height: 48, objectFit: 'cover'}} alt=""/>
                                    ) : (
                                        <Image source={{uri: item.thumbnailUrl}} style={{width: 48, height: 48}} resizeMode="cover"/>
                                    )
                                ) : (
                                    <Ionicons name="barbell-outline" size={22} color={palette.mutedForeground}/>
                                )}
                            </View>
                            <View className="flex-1">
                                <Typography variant="body" className="text-foreground">{item.title ?? 'Untitled'}</Typography>
                                {item.exerciseCategory?.value && (
                                    <Typography variant="caption" className="text-muted-foreground">{item.exerciseCategory.value}</Typography>
                                )}
                            </View>
                            <Ionicons name="add-circle-outline" size={22} color={palette.primary}/>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        !isPending ? (
                            <View className="flex-1 items-center justify-center py-16">
                                <Typography variant="muted">No exercises found</Typography>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        isPending ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator color={palette.primary}/>
                            </View>
                        ) : null
                    }
                    onEndReached={loadNextPage}
                    onEndReachedThreshold={0.3}
                />

                <View className="px-4 pb-8 pt-3 border-t border-border">
                    <Button label="Cancel" variant="secondary" onPress={onClose}/>
                </View>
            </View>
        </Modal>
    );
}
