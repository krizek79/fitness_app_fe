import {z} from 'zod';
import {updatePlanBody} from '@/src/api/generated/zod/plan/plan';

export const DESCRIPTION_MAX = 2000;
export const WEEKS_MIN = 1;
export const WEEKS_MAX = 52;

export const planEditSchema = updatePlanBody
    .omit({weeks: true})
    .extend({
        title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or fewer'),
        numberOfWeeks: z.number().int().min(WEEKS_MIN, 'At least 1 week is required').max(WEEKS_MAX, `Maximum ${WEEKS_MAX} weeks`),
        traineeId: z.number().int().optional(),
    });

export type PlanEditFormValues = z.infer<typeof planEditSchema>;
