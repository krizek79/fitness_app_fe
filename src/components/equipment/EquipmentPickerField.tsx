import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Image, Modal, Platform, Pressable, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useFilterEquipment} from '@/src/api/generated/equipment/equipment';
import type {EquipmentResponse} from '@/src/api/generated/model';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Button} from '@/src/components/primitives/ui/Button';
import {themeColors} from '@/src/constants/colors';
import {cn} from '@/src/lib/utils';
import {useDebounce} from '@/src/hooks/useDebounce';

const PAGE_SIZE = 20;

interface EquipmentPickerFieldProps {
    value: number[];
    onChange: (ids: number[]) => void;
    label?: string;
    error?: string;
    initialItems?: EquipmentResponse[];
}

export function EquipmentPickerField({value, onChange, label, error, initialItems}: EquipmentPickerFieldProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const [modalVisible, setModalVisible] = useState(false);
    // Full objects for display; kept in sync with `value`
    const [selectedItems, setSelectedItems] = useState<EquipmentResponse[]>(initialItems ?? []);

    useEffect(() => {
        if (initialItems && initialItems.length > 0) {
            setSelectedItems(initialItems);
        }
    }, [initialItems]);

    // Prune display objects when IDs are removed externally (e.g. clearing filters)
    useEffect(() => {
        setSelectedItems(prev => prev.filter(item => item.id != null && value.includes(item.id)));
    }, [value]);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [listItems, setListItems] = useState<EquipmentResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const {mutate, isPending} = useFilterEquipment();

    const fetchPage = useCallback((pageNum: number, title: string) => {
        mutate(
            {data: {page: pageNum, size: PAGE_SIZE, sortBy: 'title', sortDirection: 'ASC', title: title || undefined}},
            {
                onSuccess(data) {
                    const results = data.results ?? [];
                    setListItems(prev => pageNum === 0 ? results : [...prev, ...results]);
                    setTotalPages(data.totalPages ?? 1);
                    setPage(pageNum);
                },
            },
        );
    }, [mutate]);

    // Reset + refetch when search changes
    useEffect(() => {
        if (!modalVisible) return;
        setListItems([]);
        setPage(0);
        fetchPage(0, debouncedSearch);
    }, [debouncedSearch, modalVisible, fetchPage]);

    function openModal() {
        setSearch('');
        setListItems([]);
        setPage(0);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
    }

    function toggleItem(item: EquipmentResponse) {
        const id = item.id!;
        const isSelected = value.includes(id);
        if (isSelected) {
            onChange(value.filter(v => v !== id));
            setSelectedItems(prev => prev.filter(e => e.id !== id));
        } else {
            onChange([...value, id]);
            setSelectedItems(prev => [...prev, item]);
        }
    }

    function removeItem(id: number) {
        onChange(value.filter(v => v !== id));
        setSelectedItems(prev => prev.filter(e => e.id !== id));
    }

    function loadNextPage() {
        if (isPending || page + 1 >= totalPages) return;
        fetchPage(page + 1, debouncedSearch);
    }

    const isDark = colorScheme === 'dark';
    const modalBg = isDark ? '#0f0f0f' : '#ffffff';
    const borderColor = error ? palette.destructive : palette.border;

    return (
        <View className="gap-1.5">
            {label && (
                <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
            )}

            {/* Trigger */}
            <Pressable
                onPress={openModal}
                className={cn(
                    'flex-row items-center justify-between rounded-md border bg-background px-4',
                )}
                style={{height: 48, borderColor}}
            >
                <Typography
                    variant="body"
                    className={value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}
                >
                    {value.length > 0
                        ? `${value.length} equipment selected`
                        : 'Select equipment (optional)'}
                </Typography>
                <Ionicons name="add-circle-outline" size={18} color={palette.mutedForeground}/>
            </Pressable>

            {/* Selected chips */}
            {selectedItems.length > 0 && (
                <View className="flex-row flex-wrap gap-2 pt-1">
                    {selectedItems.map(item => (
                        <View
                            key={item.id}
                            className="flex-row items-center gap-1 rounded-full border border-border bg-muted px-3 py-1"
                        >
                            <Typography variant="caption" className="text-foreground">
                                {item.title ?? 'Untitled'}
                            </Typography>
                            <Pressable onPress={() => removeItem(item.id!)} hitSlop={8}>
                                <Ionicons name="close" size={14} color={palette.mutedForeground}/>
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}

            {error && (
                <Typography variant="caption" style={{color: palette.destructive}}>{error}</Typography>
            )}

            {/* Picker modal — only mount when open so the web overlay never blocks touches */}
            {modalVisible && <Modal
                visible={true}
                animationType="slide"
                presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
                onRequestClose={closeModal}
            >
                <View style={{flex: 1, backgroundColor: modalBg}}>
                    {/* Header */}
                    <View
                        className="flex-row items-center justify-between border-b border-border px-4"
                        style={{paddingTop: Platform.OS === 'ios' ? 16 : 48, paddingBottom: 12}}
                    >
                        <Typography variant="body" className="font-semibold text-foreground">
                            Select Equipment
                        </Typography>
                        <Pressable onPress={closeModal} hitSlop={12}>
                            <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                        </Pressable>
                    </View>

                    {/* Search */}
                    <View className="px-4 py-3">
                        <SearchInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search equipment..."
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={listItems}
                        keyExtractor={item => String(item.id)}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
                        renderItem={({item}) => {
                            const selected = value.includes(item.id!);
                            return (
                                <Pressable
                                    onPress={() => toggleItem(item)}
                                    className="flex-row items-center gap-3 px-4 border-b border-border"
                                    style={{paddingVertical: 10}}
                                >
                                    {/* Thumbnail */}
                                    <View
                                        className="rounded-md bg-muted items-center justify-center overflow-hidden"
                                        style={{width: 48, height: 48}}
                                    >
                                        {item.thumbnailUrl ? (
                                            Platform.OS === 'web' ? (
                                                <img
                                                    src={item.thumbnailUrl}
                                                    style={{width: 48, height: 48, objectFit: 'cover'}}
                                                 alt=""/>
                                            ) : (
                                                <Image
                                                    source={{uri: item.thumbnailUrl}}
                                                    style={{width: 48, height: 48}}
                                                    resizeMode="cover"
                                                />
                                            )
                                        ) : (
                                            <Ionicons name="cube-outline" size={22} color={palette.mutedForeground}/>
                                        )}
                                    </View>
                                    <Typography variant="body" className="flex-1 text-foreground">
                                        {item.title ?? 'Untitled'}
                                    </Typography>
                                    {selected && (
                                        <Ionicons name="checkmark" size={20} color={palette.primary}/>
                                    )}
                                </Pressable>
                            );
                        }}
                        ListEmptyComponent={
                            !isPending ? (
                                <View className="flex-1 items-center justify-center py-16">
                                    <Typography variant="muted">No equipment found</Typography>
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
                        <Button label="Done" onPress={closeModal}/>
                    </View>
                </View>
            </Modal>}
        </View>
    );
}
