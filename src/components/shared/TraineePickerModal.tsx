import {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Modal, Platform, Pressable, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useFilterClients} from '@/src/api/generated/coaching-contract/coaching-contract';
import type {ProfileSimpleResponse} from '@/src/api/generated/model';
import {SearchInput} from '@/src/components/primitives/form/SearchInput';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {Button} from '@/src/components/primitives/ui/Button';
import {themeColors} from '@/src/constants/colors';
import {useDebounce} from '@/src/hooks/useDebounce';

interface TraineePickerModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (trainee: ProfileSimpleResponse | null) => void;
}

export function TraineePickerModal({visible, onClose, onSelect}: TraineePickerModalProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];
    const modalBg = colorScheme === 'dark' ? '#0f0f0f' : '#ffffff';

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);
    const [items, setItems] = useState<ProfileSimpleResponse[]>([]);

    const {mutate, isPending} = useFilterClients();

    const fetchClients = useCallback((name: string) => {
        mutate(
            {data: {page: 0, size: 50, sortBy: 'id', sortDirection: 'ASC', name: name || undefined}},
            {
                onSuccess(data) {
                    setItems(data.results ?? []);
                },
            },
        );
    }, [mutate]);

    useEffect(() => {
        if (!visible) return;
        fetchClients(debouncedSearch);
    }, [debouncedSearch, visible, fetchClients]);

    useEffect(() => {
        if (visible) {
            setSearch('');
            setItems([]);
        }
    }, [visible]);

    function handleSelect(trainee: ProfileSimpleResponse | null) {
        onSelect(trainee);
        onClose();
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
                    <Typography variant="body" className="font-semibold text-foreground">Assign Trainee</Typography>
                    <Pressable onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={palette.mutedForeground}/>
                    </Pressable>
                </View>

                <View className="px-4 py-3">
                    <SearchInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search trainees..."
                        autoFocus
                    />
                </View>

                <FlatList
                    data={items}
                    keyExtractor={item => String(item.id)}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{paddingBottom: 24, flexGrow: 1}}
                    ListHeaderComponent={
                        <Pressable
                            onPress={() => handleSelect(null)}
                            className="flex-row items-center gap-3 px-4 border-b border-border"
                            style={{paddingVertical: 14}}
                        >
                            <Ionicons name="person-remove-outline" size={20} color={palette.mutedForeground}/>
                            <Typography variant="body" className="text-muted-foreground">No trainee (remove assignment)</Typography>
                        </Pressable>
                    }
                    renderItem={({item}) => (
                        <Pressable
                            onPress={() => handleSelect(item)}
                            className="flex-row items-center gap-3 px-4 border-b border-border"
                            style={{paddingVertical: 14}}
                        >
                            <Ionicons name="person-outline" size={20} color={palette.mutedForeground}/>
                            <Typography variant="body" className="text-foreground">{item.name ?? 'Unknown'}</Typography>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        !isPending ? (
                            <View className="flex-1 items-center justify-center py-16">
                                <Typography variant="muted">No clients found</Typography>
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
                />

                <View className="px-4 pb-8 pt-3 border-t border-border">
                    <Button label="Cancel" variant="secondary" onPress={onClose}/>
                </View>
            </View>
        </Modal>
    );
}
