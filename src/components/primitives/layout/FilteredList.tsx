import React from 'react';
import {ActivityIndicator, FlatList, Platform, RefreshControl, View} from 'react-native';
import type {ListRenderItem} from 'react-native';
import {useColorScheme} from 'nativewind';
import {themeColors} from '@/src/constants/colors';
import {EmptyState} from './EmptyState';

interface FilteredListProps<TItem> {
    data: TItem[];
    renderItem: ListRenderItem<TItem>;
    keyExtractor: (item: TItem) => string;
    filterBar: React.ReactNode;
    skeleton: React.ReactNode;
    emptyIcon: React.ReactNode;
    emptyTitle: string;
    emptyDescription: string;
    isInitialLoad: boolean;
    isPending: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
    onEndReached: () => void;
    fab?: React.ReactNode;
}

export function FilteredList<TItem>({
    data,
    renderItem,
    keyExtractor,
    filterBar,
    skeleton,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    isInitialLoad,
    isPending,
    isRefreshing,
    onRefresh,
    onEndReached,
    fab,
}: FilteredListProps<TItem>) {
    const {colorScheme} = useColorScheme();
    const palette = themeColors[colorScheme ?? 'light'];

    const refreshControl = Platform.OS !== 'web' ? (
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={palette.primary}/>
    ) : undefined;

    return (
        <View className="flex-1 bg-background">
            {filterBar}
            <FlatList<TItem>
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingBottom: 88, gap: 12, flexGrow: 1}}
                ListEmptyComponent={
                    isInitialLoad
                        ? <>{skeleton}</>
                        : (
                            <EmptyState
                                icon={emptyIcon}
                                title={emptyTitle}
                                description={emptyDescription}
                            />
                        )
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                refreshControl={refreshControl}
                ListFooterComponent={
                    isPending && data.length > 0
                        ? (
                            <View className="py-4 items-center">
                                <ActivityIndicator color={palette.primary}/>
                            </View>
                        )
                        : null
                }
            />
            {fab}
        </View>
    );
}
