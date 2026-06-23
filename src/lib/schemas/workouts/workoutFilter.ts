import {z} from 'zod';

export const workoutFilterSchema = z.object({
    title: z.string(),
    sortDirection: z.enum(['ASC', 'DESC']),
    tagIdList: z.array(z.number()),
});

export type WorkoutFilterFormValues = z.infer<typeof workoutFilterSchema>;

export const WORKOUT_FILTER_DEFAULTS: WorkoutFilterFormValues = {
    title: '',
    sortDirection: 'ASC',
    tagIdList: [],
};
