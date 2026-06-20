import {useCallback, useEffect, useRef, useState} from 'react';
import {useFocusEffect} from 'expo-router';

/**
 * Manages pagination state for list screens backed by a POST /filter mutation.
 *
 * The caller provides a `fetch` function that closes over the current filter
 * values and calls the Orval-generated mutate. The hook handles:
 *  - resetting + re-fetching when filterDeps change
 *  - re-fetching when the screen comes back into focus
 *  - appending pages on loadNextPage
 *  - pull-to-refresh without clearing the visible list
 *
 * @example
 * const {mutate, isPending} = useFilterPlans();
 * const {items, isInitialLoad, isEmpty, isRefreshing, refresh, loadNextPage} =
 *   usePaginatedMutation<PlanSimpleResponse>({
 *     fetch: (page, onSuccess, onSettled) =>
 *       mutate(
 *         {data: {page, size: 20, sortBy: 'title', sortDirection, title: debouncedTitle || undefined}},
 *         {onSuccess: d => onSuccess(d.results ?? [], d.totalPages ?? 1), onSettled},
 *       ),
 *     isPending,
 *     filterDeps: [debouncedTitle, sortDirection],
 *   });
 */
export function usePaginatedMutation<TItem>({
    fetch,
    isPending,
    filterDeps = [],
}: {
    fetch: (
        page: number,
        onSuccess: (results: TItem[], totalPages: number) => void,
        onSettled?: () => void,
    ) => void;
    isPending: boolean;
    filterDeps?: unknown[];
}) {
    const [items, setItems] = useState<TItem[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Always call the latest fetch closure without recreating fetchPage
    const fetchRef = useRef(fetch);
    fetchRef.current = fetch;

    const fetchPage = useCallback((pageNum: number, onDone?: () => void) => {
        fetchRef.current(
            pageNum,
            (results, total) => {
                setItems(prev => pageNum === 0 ? results : [...prev, ...results]);
                setTotalPages(total);
            },
            onDone,
        );
    }, []);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        setPage(0);
        fetchPage(0, () => setIsRefreshing(false));
    }, [fetchPage]);

    // Refetch when the screen regains focus (e.g. returning from a detail screen)
    useFocusEffect(
        useCallback(() => {
            setPage(0);
            setItems([]);
            fetchPage(0);
        }, [fetchPage]),
    );

    // Reset and refetch whenever filter values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setPage(0);
        setItems([]);
        fetchPage(0);
    }, filterDeps);

    function loadNextPage() {
        if (isPending) return;
        const nextPage = page + 1;
        if (nextPage >= totalPages) return;
        setPage(nextPage);
        fetchPage(nextPage);
    }

    return {
        items,
        isRefreshing,
        refresh,
        loadNextPage,
        /** True only on the very first load (no items yet and request in flight). Use to show skeletons. */
        isInitialLoad: isPending && items.length === 0,
        /** True when the request settled with zero results. */
        isEmpty: !isPending && items.length === 0,
    };
}
