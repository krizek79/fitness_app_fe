import {useEffect, useRef} from 'react';
import {useCreateDraft, useUpdateDraft, useDeleteDraft, useFilterDrafts} from '@/src/api/generated/draft/draft';
import {DraftCreateRequestEntityType} from '@/src/api/generated/model/draftCreateRequestEntityType';
import {DraftFilterRequestEntityType} from '@/src/api/generated/model/draftFilterRequestEntityType';
import type {PlanCreateFormValues} from '@/src/lib/schemas/plans/planCreate';

// Content key used to store plan form values inside the generic draft content map
const CONTENT_KEY = 'plan';

interface UsePlanDraftOptions {
    onDraftLoaded: (values: Partial<PlanCreateFormValues>) => void;
}

export function usePlanDraft({onDraftLoaded}: UsePlanDraftOptions) {
    const draftIdRef = useRef<number | null>(null);
    const isSavingRef = useRef(false);

    const {mutate: filterDrafts} = useFilterDrafts();
    const {mutate: createDraft} = useCreateDraft();
    const {mutate: updateDraft} = useUpdateDraft();
    const {mutate: deleteDraft} = useDeleteDraft();

    // On mount: look for an existing PLAN draft and restore it
    useEffect(() => {
        filterDrafts(
            {data: {page: 0, size: 1, sortBy: 'id', sortDirection: 'DESC', entityType: DraftFilterRequestEntityType.PLAN}},
            {
                onSuccess(data) {
                    const draft = data.results?.[0];
                    if (!draft?.id) return;
                    draftIdRef.current = draft.id;
                    const content = draft.content?.[CONTENT_KEY] as Partial<PlanCreateFormValues> | undefined;
                    if (content) onDraftLoaded(content);
                },
            },
        );
    }, []);

    function save(values: PlanCreateFormValues) {
        if (isSavingRef.current) return;
        isSavingRef.current = true;

        const content = {[CONTENT_KEY]: values as Record<string, unknown>};

        if (draftIdRef.current) {
            updateDraft(
                {id: draftIdRef.current, data: {content}},
                {onSettled: () => { isSavingRef.current = false; }},
            );
        } else {
            createDraft(
                {data: {entityType: DraftCreateRequestEntityType.PLAN, content}},
                {
                    onSuccess(data) {
                        if (data.id) draftIdRef.current = data.id;
                    },
                    onSettled: () => { isSavingRef.current = false; },
                },
            );
        }
    }

    function discard() {
        if (draftIdRef.current) {
            deleteDraft({id: draftIdRef.current});
            draftIdRef.current = null;
        }
    }

    return {save, discard};
}
