# WeekWorkout — Implementation Plan (Parked)

## API Summary

| Operation | Hook | Endpoint |
|---|---|---|
| Create | `useCreateWeekWorkout` | POST `/week-workouts` |
| Update | `useUpdateWeekWorkout` | PUT `/week-workouts/{id}` |
| Delete | `useDeleteWeekWorkout` | DELETE `/week-workouts/{id}` — direct, no aggregate needed |

### Key types

**`WeekWorkoutInputRequest`**
```ts
{
  weekId: number;
  dayOfWeek: WeekWorkoutInputRequestDayOfWeek; // MONDAY…SUNDAY
  orderInTheDay: number;   // min 1, defaults 1
  completed: boolean;
  workoutToCloneId?: number;   // clone from template
  workoutToUpdateId?: number;  // update existing owned workout
  workout?: WorkoutInputRequest; // inline create/update
}
```

**`WeekWorkoutResponse`**
```ts
{
  id?: number;
  weekId?: number;
  workout?: WorkoutSimpleResponse;
  dayOfWeek?: WeekWorkoutResponseDayOfWeek;
  orderInTheDay?: number;
  completed?: boolean;
}
```

**`WorkoutDetailResponse`** (for the drill-down into exercises/sets)
```ts
{
  id, title, author, trainee, tags, description,
  isTemplate, weightUnit, note,
  workoutExercises: WorkoutExerciseResponse[]
}
```

**`WorkoutExerciseResponse`**
```ts
{
  id, workoutId, order, exercise: ExerciseDetailResponse,
  workoutExerciseMetric: ReferenceDataResponse,
  note,
  workoutExerciseSets: WorkoutExerciseSetResponse[]
}
```

---

## Planned Screens / Flows

### 1. Week detail enhancements (`app/week/[id].tsx` — already exists)
- Tap a day row → navigate to weekWorkout detail or create
- "Add workout" affordance per day or floating FAB

### 2. WeekWorkout detail screen (`app/week-workout/[id].tsx`)
- Shows: workout title, day, orderInTheDay, completed toggle
- Actions: edit day/order, delete (direct API), drill into workout exercises

### 3. WeekWorkout create flow
- Pick day of week
- Pick workout source:
  - Clone from template (`workoutToCloneId`)
  - Create inline (`workout: WorkoutInputRequest`)
- `useCreateWeekWorkout`

### 4. Workout detail screen (`app/workout/[id].tsx`)
- Exercises list from `WorkoutDetailResponse.workoutExercises`
- Each exercise: name, metric, sets
- Exercise reordering → use `SortableList<WorkoutExerciseResponse>`
- Set reordering → use `SortableList<WorkoutExerciseSetResponse>`

---

## Open Questions (answer before implementing)

1. **Workout ownership**: Is each weekWorkout's workout always a private clone, or can multiple weekWorkouts share a workout? (`workoutToCloneId` vs `workoutToUpdateId` pattern suggests owned copies.)
2. **Add workout entry point**: From week detail tapping a day, or via a workout library picker?
3. **Start point**: weekWorkout detail (simplest) → create flow → workout exercises/sets.
