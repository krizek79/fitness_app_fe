import {useEffect, useState} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useColorScheme} from 'nativewind';
import {useFilterTags} from '@/src/api/generated/tag/tag';
import type {TagPageResponse, TagResponse} from '@/src/api/generated/model';
import {FilterModal} from '@/src/components/primitives/filter/FilterModal';
import {Typography} from '@/src/components/primitives/ui/Typography';
import {themeColors} from '@/src/constants/colors';

interface TagInputFieldProps {
    value: string[];
    onChange: (names: string[]) => void;
    label?: string;
}

export function TagInputField({value, onChange, label}: TagInputFieldProps) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const [modalVisible, setModalVisible] = useState(false);
    const [allTags, setAllTags] = useState<TagResponse[]>([]);
    const [pending, setPending] = useState<string[]>(value);
    const [customInput, setCustomInput] = useState('');

    const {mutate: fetchTags} = useFilterTags();

    useEffect(() => {
        fetchTags(
            {data: {page: 0, size: 200, sortBy: 'name', sortDirection: 'ASC'}},
            {onSuccess: (d: TagPageResponse) => setAllTags(d.results ?? [])},
        );
    }, [fetchTags]);

    function openModal() {
        setPending(value);
        setCustomInput('');
        setModalVisible(true);
    }

    function handleApply() {
        onChange(pending);
        setModalVisible(false);
    }

    function toggleTag(name: string) {
        setPending(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
    }

    function addCustomTag() {
        const trimmed = customInput.trim();
        if (!trimmed || pending.includes(trimmed)) return;
        setPending(prev => [...prev, trimmed]);
        setCustomInput('');
    }

    function removeTag(name: string) {
        onChange(value.filter(t => t !== name));
    }

    return (
        <>
            <View className="gap-1.5">
                {label && (
                    <Typography variant="body-sm" className="font-medium text-foreground">{label}</Typography>
                )}

                <Pressable
                    onPress={openModal}
                    className="flex-row items-center justify-between rounded-md border border-input bg-background px-4"
                    style={{height: 48}}
                >
                    <Typography variant="body" className={value.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                        {value.length > 0 ? `${value.length} tag${value.length > 1 ? 's' : ''} selected` : 'Add tags (optional)'}
                    </Typography>
                    <Ionicons name="pricetags-outline" size={18} color={palette.mutedForeground}/>
                </Pressable>

                {value.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 pt-1">
                        {value.map(name => (
                            <View key={name} className="flex-row items-center gap-1 rounded-full border border-border bg-muted px-3 py-1">
                                <Typography variant="caption" className="text-foreground">{name}</Typography>
                                <Pressable onPress={() => removeTag(name)} hitSlop={8}>
                                    <Ionicons name="close" size={14} color={palette.mutedForeground}/>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <FilterModal visible={modalVisible} title="Tags" onClose={() => setModalVisible(false)} onApply={handleApply}>
                {/* Custom tag input */}
                <View className="gap-2">
                    <Typography variant="body-sm" className="font-medium text-foreground">Add custom tag</Typography>
                    <View className="flex-row gap-2">
                        <TextInput
                            value={customInput}
                            onChangeText={setCustomInput}
                            onSubmitEditing={addCustomTag}
                            placeholder="Type a tag name..."
                            placeholderTextColor={palette.mutedForeground}
                            returnKeyType="done"
                            className="flex-1 rounded-md border border-input bg-background px-4 text-base text-foreground"
                            style={{height: 44}}
                        />
                        <Pressable
                            onPress={addCustomTag}
                            className="items-center justify-center rounded-md bg-primary px-4"
                            style={{height: 44}}
                        >
                            <Ionicons name="add" size={20} color="#000"/>
                        </Pressable>
                    </View>
                </View>

                {/* Existing tags */}
                {allTags.length > 0 && (
                    <View className="gap-2">
                        <Typography variant="body-sm" className="font-medium text-foreground">Existing tags</Typography>
                        <View className="flex-row flex-wrap gap-2">
                            {allTags.map(tag => {
                                const isSelected = pending.includes(tag.name!);
                                return (
                                    <Pressable
                                        key={tag.id}
                                        onPress={() => toggleTag(tag.name!)}
                                        className={`rounded-full border px-3 py-1.5 ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                    >
                                        <Typography
                                            variant="caption"
                                            className={`font-medium ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                                        >
                                            {tag.name}
                                        </Typography>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Currently pending custom tags not in existing list */}
                {pending.filter(name => !allTags.some(t => t.name === name)).length > 0 && (
                    <View className="gap-2">
                        <Typography variant="body-sm" className="font-medium text-foreground">Custom tags</Typography>
                        <View className="flex-row flex-wrap gap-2">
                            {pending.filter(name => !allTags.some(t => t.name === name)).map(name => (
                                <Pressable
                                    key={name}
                                    onPress={() => toggleTag(name)}
                                    className="rounded-full border bg-primary border-primary px-3 py-1.5"
                                >
                                    <Typography variant="caption" className="font-medium text-primary-foreground">{name}</Typography>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}
            </FilterModal>
        </>
    );
}
