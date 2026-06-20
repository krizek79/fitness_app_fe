import {z} from 'zod';
import {filterPlansBody} from '@/src/api/generated/zod/plan/plan';

export const planFilterSchema = filterPlansBody.pick({
    title: true,
    sortDirection: true,
}).extend({
    // Narrow sortDirection from string to the actual enum values
    sortDirection: z.enum(['ASC', 'DESC']),
});

export type PlanFilterFormValues = z.infer<typeof planFilterSchema>;

export const PLAN_FILTER_DEFAULTS: PlanFilterFormValues = {
    title: '',
    sortDirection: 'ASC',
};
