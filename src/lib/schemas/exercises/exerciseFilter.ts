import {z} from 'zod';
import {filterExercisesBody} from '@/src/api/generated/zod/exercise/exercise';

export const exerciseFilterSchema = filterExercisesBody.pick({
    title: true,
    exerciseCategory: true,
    movementPatterns: true,
    muscles: true,
    requiredEquipmentIds: true,
}).extend({
    sortDirection: z.enum(['ASC', 'DESC']),
});

export type ExerciseFilterFormValues = z.infer<typeof exerciseFilterSchema>;

export const EXERCISE_FILTER_DEFAULTS: ExerciseFilterFormValues = {
    title: '',
    sortDirection: 'ASC',
    exerciseCategory: undefined,
    movementPatterns: [],
    muscles: [],
    requiredEquipmentIds: [],
};
