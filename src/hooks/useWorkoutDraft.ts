import {useEffect, useRef, useState} from 'react';
import {useCreateDraft, useDeleteDraft, useFilterDrafts, useUpdateDraft} from '@/src/api/generated/draft/draft';
import {DraftCreateRequestEntityType} from '@/src/api/generated/model/draftCreateRequestEntityType';
import {DraftFilterRequestEntityType} from '@/src/api/generated/model/draftFilterRequestEntityType';
import type {DraftResponse} from '@/src/api/generated/model';
import type {WorkoutCreateFormValues} from '@/src/lib/schemas/workouts/workoutCreate';

const CONTENT_KEY = 'workout';

// Maps create entity types to filter entity types (same string values, different TS aliases)
function toFilterType(type: DraftCreateRequestEntityType): DraftFilterRequestEntityType {
    return type as unknown as DraftFilterRequestEntityType;
}

// ─── List hook (for draft picker screen) ──────────────────────────────────────

interface UseWorkoutDraftListResult {
    drafts: DraftResponse[];
    isLoading: boolean;
    deleteDraft: (id: number) => void;
    refresh: () => void;
}

export function useWorkoutDraftList(entityType: DraftCreateRequestEntityType): UseWorkoutDraftListResult {
    const [drafts, setDrafts] = useState<DraftResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const {mutate: filterDrafts} = useFilterDrafts();
    const {mutate: deleteDraftMutate} = useDeleteDraft();

    function load() {
        setIsLoading(true);
        filterDrafts(
            {data: {page: 0, size: 50, sortBy: 'id', sortDirection: 'DESC', entityType: toFilterType(entityType)}},
            {
                onSuccess(data) { setDrafts(data.results ?? []); },
                onSettled() { setIsLoading(false); },
            },
        );
    }

    useEffect(() => { load(); }, []);

    function deleteDraft(id: number) {
        deleteDraftMutate({id}, {onSuccess: () => setDrafts(prev => prev.filter(d => d.id !== id))});
    }

    return {drafts, isLoading, deleteDraft, refresh: load};
}

// Extract the workout title from draft content for display in picker
export function getDraftDisplayTitle(draft: DraftResponse): string {
    const content = draft.content?.[CONTENT_KEY] as Partial<WorkoutCreateFormValues> | undefined;
    return content?.title?.trim() || 'Untitled workout';
}

// ─── Single-draft hook (for form screen) ──────────────────────────────────────

interface UseWorkoutDraftOptions {
    draftId: number | null;
    entityType: DraftCreateRequestEntityType;
    onDraftLoaded?: (values: Partial<WorkoutCreateFormValues>) => void;
}

interface UseWorkoutDraftResult {
    save: (values: WorkoutCreateFormValues) => void;
    discard: () => void;
}

export function useWorkoutDraft({draftId, entityType, onDraftLoaded}: UseWorkoutDraftOptions): UseWorkoutDraftResult {
    const currentDraftIdRef = useRef<number | null>(draftId);
    const isSavingRef = useRef(false);

    const {mutate: filterDrafts} = useFilterDrafts();
    const {mutate: createDraft} = useCreateDraft();
    const {mutate: updateDraft} = useUpdateDraft();
    const {mutate: deleteDraft} = useDeleteDraft();

    useEffect(() => {
        if (draftId === null) return;
        filterDrafts(
            {data: {page: 0, size: 50, sortBy: 'id', sortDirection: 'DESC', entityType: toFilterType(entityType)}},
            {
                onSuccess(data) {
                    const draft = data.results?.find(d => d.id === draftId);
                    if (!draft?.content) return;
                    const content = draft.content[CONTENT_KEY] as Partial<WorkoutCreateFormValues> | undefined;
                    if (content) onDraftLoaded?.(content);
                },
            },
        );
    }, []);

    function save(values: WorkoutCreateFormValues) {
        if (isSavingRef.current) return;
        isSavingRef.current = true;
        const content = {[CONTENT_KEY]: values as Record<string, unknown>};

        if (currentDraftIdRef.current !== null) {
            updateDraft(
                {id: currentDraftIdRef.current, data: {content}},
                {onSettled: () => { isSavingRef.current = false; }},
            );
        } else {
            createDraft(
                {data: {entityType, content}},
                {
                    onSuccess(data) { if (data.id) currentDraftIdRef.current = data.id; },
                    onSettled: () => { isSavingRef.current = false; },
                },
            );
        }
    }

    function discard() {
        if (currentDraftIdRef.current !== null) {
            deleteDraft({id: currentDraftIdRef.current});
            currentDraftIdRef.current = null;
        }
    }

    return {save, discard};
}
