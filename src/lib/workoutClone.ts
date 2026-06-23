import type {WorkoutDetailResponse} from '@/src/api/generated/model';
import type {WorkoutCreateFormValues} from '@/src/lib/schemas/workouts/workoutCreate';

export function cloneWorkoutToFormValues(detail: WorkoutDetailResponse): WorkoutCreateFormValues {
    return {
        title: detail.title ?? '',
        description: detail.description ?? undefined,
        weightUnit: (detail.weightUnit?.key ?? 'KG') as 'KG' | 'LB',
        distanceUnit: (detail.distanceUnit?.key ?? 'KM') as 'KM' | 'MILES',
        tags: (detail.tags ?? []).map(t => t.name ?? '').filter(Boolean),
        workoutExercises: (detail.workoutExercises ?? []).map((ex, i) => ({
            _stableId: `clone-${ex.exercise?.id}-${i}-${Date.now()}`,
            _exerciseTitle: ex.exercise?.title ?? 'Untitled',
            _exerciseThumbnailUrl: ex.exercise?.thumbnailUrl ?? undefined,
            exerciseId: ex.exercise?.id!,
            order: ex.order ?? i + 1,
            workoutExerciseMetric: (ex.workoutExerciseMetric?.key ?? 'REPS_AND_WEIGHT') as WorkoutCreateFormValues['workoutExercises'][number]['workoutExerciseMetric'],
            note: ex.note ?? undefined,
            workoutExerciseSets: (ex.workoutExerciseSets ?? []).map((s, si) => ({
                order: s.order ?? si + 1,
                workoutExerciseSetType: (s.workoutExerciseSetType?.key ?? 'STRAIGHT_SET') as WorkoutCreateFormValues['workoutExercises'][number]['workoutExerciseSets'][number]['workoutExerciseSetType'],
                note: s.note ?? undefined,
            })),
        })),
    };
}
