import {z} from 'zod';

export const SET_TYPE_VALUES = ['WARMUP', 'TOP_SET', 'BACKOFF_SET', 'STRAIGHT_SET', 'DROP_SET'] as const;
export const METRIC_VALUES = ['REPS', 'TIME', 'REPS_AND_WEIGHT', 'TIME_AND_WEIGHT', 'DISTANCE', 'DISTANCE_AND_TIME'] as const;
export const WEIGHT_UNIT_VALUES = ['KG', 'LB'] as const;
export const DISTANCE_UNIT_VALUES = ['KM', 'MILES'] as const;

export const SET_TYPE_LABELS: Record<typeof SET_TYPE_VALUES[number], string> = {
    WARMUP: 'Warm-up',
    TOP_SET: 'Top set',
    BACKOFF_SET: 'Backoff',
    STRAIGHT_SET: 'Straight',
    DROP_SET: 'Drop set',
};

export const METRIC_LABELS: Record<typeof METRIC_VALUES[number], string> = {
    REPS: 'Reps',
    TIME: 'Time',
    REPS_AND_WEIGHT: 'Reps & Weight',
    TIME_AND_WEIGHT: 'Time & Weight',
    DISTANCE: 'Distance',
    DISTANCE_AND_TIME: 'Distance & Time',
};

export const workoutExerciseSetSchema = z.object({
    _backendId: z.number().int().optional(),
    order: z.number().int().positive(),
    workoutExerciseSetType: z.enum(SET_TYPE_VALUES),
    note: z.string().max(500).nullish(),
});

export const workoutExerciseSchema = z.object({
    _backendId: z.number().int().optional(),
    _stableId: z.string(),
    _exerciseTitle: z.string(),
    _exerciseThumbnailUrl: z.string().nullish(),
    exerciseId: z.number().int(),
    order: z.number().int().positive(),
    workoutExerciseMetric: z.enum(METRIC_VALUES),
    note: z.string().max(500).nullish(),
    workoutExerciseSets: z.array(workoutExerciseSetSchema),
});

export const workoutCreateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(64, 'Max 64 characters'),
    description: z.string().max(1000).optional(),
    weightUnit: z.enum(WEIGHT_UNIT_VALUES),
    distanceUnit: z.enum(DISTANCE_UNIT_VALUES),
    tags: z.array(z.string()),
    workoutExercises: z.array(workoutExerciseSchema),
    traineeId: z.number().int().optional(),
});

export type WorkoutCreateFormValues = z.infer<typeof workoutCreateSchema>;
export type WorkoutExerciseFormValues = z.infer<typeof workoutExerciseSchema>;
export type WorkoutExerciseSetFormValues = z.infer<typeof workoutExerciseSetSchema>;

export const WORKOUT_CREATE_DEFAULTS: WorkoutCreateFormValues = {
    title: '',
    description: undefined,
    weightUnit: 'KG',
    distanceUnit: 'KM',
    tags: [],
    workoutExercises: [],
    traineeId: undefined,
};

export const DESCRIPTION_MAX = 1000;
