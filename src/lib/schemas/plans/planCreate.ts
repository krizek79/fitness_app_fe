import {z} from 'zod';
import {createPlanBody} from '@/src/api/generated/zod/plan/plan';

export const WEEKS_MIN = 1;
export const WEEKS_MAX = 52;
export const DESCRIPTION_MAX = 2000;

export const planCreateSchema = createPlanBody
    .omit({weeks: true, traineeId: true})
    .extend({
        title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or fewer'),
        numberOfWeeks: z.number().int().min(WEEKS_MIN, 'At least 1 week is required').max(WEEKS_MAX, `Maximum ${WEEKS_MAX} weeks`),
    });

export type PlanCreateFormValues = z.infer<typeof planCreateSchema>;

export const PLAN_CREATE_DEFAULTS: PlanCreateFormValues = {
    title: '',
    description: '',
    numberOfWeeks: 1,
};
