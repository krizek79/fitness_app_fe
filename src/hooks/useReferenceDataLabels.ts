import {useCallback, useMemo} from 'react';
import {useGetReferenceData} from '@/src/api/generated/reference-data/reference-data';

/**
 * Fetches backend-provided display labels for a reference data type.
 * Results are cached by TanStack Query — multiple components using the same
 * type string share a single request.
 *
 * Falls back to the raw key while loading or if the key is not found.
 */
export function useReferenceDataLabels(type: string) {
    const {data, isLoading} = useGetReferenceData(type);

    const labelMap = useMemo(() => {
        const map = new Map<string, string>();
        data?.forEach(r => {
            if (r.key != null) map.set(r.key, r.value ?? r.key);
        });
        return map;
    }, [data]);

    const getLabel = useCallback(
        (key: string): string => labelMap.get(key) ?? key,
        [labelMap],
    );

    return {getLabel, isLoading};
}
