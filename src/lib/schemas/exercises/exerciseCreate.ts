import {z} from 'zod';
import {createExerciseBody} from '@/src/api/generated/zod/exercise/exercise';

export const TITLE_MIN = 2;
export const TITLE_MAX = 64;

const {request} = createExerciseBody.shape;

export const exerciseCreateSchema = z.object({
    title: z.string()
        .min(TITLE_MIN, `Title must be at least ${TITLE_MIN} characters`)
        .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer`),
    exerciseCategory: request.shape.exerciseCategory,
    movementPatterns: request.shape.movementPatterns,
    muscles: request.shape.muscles,
    requiredEquipmentIds: z.array(z.number()),
});

export type ExerciseCreateFormValues = z.infer<typeof exerciseCreateSchema>;

export const EXERCISE_CREATE_DEFAULTS = {
    title: '',
    movementPatterns: [] as ExerciseCreateFormValues['movementPatterns'],
    muscles: [] as ExerciseCreateFormValues['muscles'],
    requiredEquipmentIds: [],
} satisfies Partial<ExerciseCreateFormValues>;
