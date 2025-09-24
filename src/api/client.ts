import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const WorkoutUpdateRequest = z
  .object({
    name: z.string().min(1).max(64),
    description: z.string().min(0).max(1000).optional(),
    weightUnit: z.enum(["KG", "LB"]),
    note: z.string().optional(),
    tagNames: z.array(z.string()).optional(),
    traineeId: z.number().int().optional(),
  })
  .passthrough();
const WorkoutExerciseCreateRequest = z
  .object({
    workoutId: z.number().int(),
    exerciseId: z.number().int(),
    order: z.number().int().gte(1),
    workoutExerciseType: z.enum([
      "WEIGHT",
      "WEIGHT_TIME",
      "TIME",
      "BODYWEIGHT",
    ]),
    note: z.string().optional(),
  })
  .passthrough();
const WorkoutExerciseUpdateRequest = z
  .object({
    id: z.number().int(),
    order: z.number().int().gte(1),
    workoutExerciseType: z.enum([
      "WEIGHT",
      "WEIGHT_TIME",
      "TIME",
      "BODYWEIGHT",
    ]),
    note: z.string().optional(),
  })
  .passthrough();
const BatchUpdateRequestWorkoutExerciseUpdateRequest = z
  .object({ updateRequestList: z.array(WorkoutExerciseUpdateRequest) })
  .partial()
  .passthrough();
const WorkoutExerciseSetCreateRequest = z
  .object({
    workoutExerciseId: z.number().int(),
    order: z.number().int().gte(1),
    workoutExerciseSetType: z
      .enum(["WARMUP", "TOP_SET", "BACKOFF_SET", "STRAIGHT_SET"])
      .optional(),
    goalRepetitions: z.number().int().gte(1).optional(),
    goalWeight: z.number().gte(0.125).optional(),
    goalTime: z.string().optional(),
    restDuration: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();
const WorkoutExerciseSetUpdateRequest = z
  .object({
    id: z.number().int(),
    order: z.number().int().gte(1),
    workoutExerciseSetType: z
      .enum(["WARMUP", "TOP_SET", "BACKOFF_SET", "STRAIGHT_SET"])
      .optional(),
    goalRepetitions: z.number().int().gte(1).optional(),
    actualRepetitions: z.number().int().gte(1).optional(),
    goalWeight: z.number().gte(0.125).optional(),
    actualWeight: z.number().gte(0.125).optional(),
    goalTime: z.string().optional(),
    actualTime: z.string().optional(),
    restDuration: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();
const BatchUpdateRequestWorkoutExerciseSetUpdateRequest = z
  .object({ updateRequestList: z.array(WorkoutExerciseSetUpdateRequest) })
  .partial()
  .passthrough();
const WeekCreateRequest = z
  .object({
    cycleId: z.number().int(),
    order: z.number().int().gte(1),
    note: z.string().optional(),
  })
  .passthrough();
const WeekUpdateRequest = z
  .object({
    id: z.number().int(),
    order: z.number().int().gte(1),
    note: z.string().optional(),
  })
  .passthrough();
const BatchUpdateRequestWeekUpdateRequest = z
  .object({ updateRequestList: z.array(WeekUpdateRequest) })
  .partial()
  .passthrough();
const WeekWorkoutUpdateRequest = z
  .object({ dayOfTheWeek: z.number().int().gte(1).lte(7) })
  .passthrough();
const GoalUpdateRequest = z
  .object({ text: z.string().min(0).max(1000) })
  .passthrough();
const CycleUpdateRequest = z
  .object({
    name: z.string().min(0).max(255),
    description: z.string().min(0).max(2000).optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    traineeId: z.number().int().optional(),
  })
  .passthrough();
const WorkoutCreateRequest = z
  .object({
    name: z.string().min(1).max(64),
    description: z.string().min(0).max(1000).optional(),
    weightUnit: z.enum(["KG", "LB"]),
    note: z.string().optional(),
    isTemplate: z.boolean(),
    tagNames: z.array(z.string()).optional(),
    traineeId: z.number().int().optional(),
  })
  .passthrough();
const WorkoutFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    name: z.string().optional(),
    tagIdList: z.array(z.number().int()).optional(),
    authorId: z.number().int().optional(),
    isTemplate: z.boolean().optional(),
  })
  .passthrough();
const WorkoutExerciseFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    workoutId: z.number().int(),
  })
  .passthrough();
const WorkoutExerciseSetFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    workoutExerciseId: z.number().int().optional(),
  })
  .passthrough();
const WeekFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    cycleId: z.number().int(),
  })
  .passthrough();
const WeekWorkoutCreateRequest = z
  .object({
    weekId: z.number().int(),
    workoutId: z.number().int(),
    dayOfTheWeek: z.number().int().gte(1).lte(7),
  })
  .passthrough();
const WeekWorkoutFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    weekId: z.number().int(),
  })
  .passthrough();
const TagCreateRequest = z.object({ name: z.string() }).passthrough();
const TagFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string(),
    name: z.string().optional(),
  })
  .passthrough();
const ProfileFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string(),
    name: z.string().optional(),
  })
  .passthrough();
const GoalCreateRequest = z
  .object({ text: z.string().min(0).max(1000), cycleId: z.number().int() })
  .passthrough();
const GoalFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    cycleId: z.number().int(),
  })
  .passthrough();
const ExerciseCreateRequest = z
  .object({
    name: z.string().min(2).max(64),
    muscleGroupSet: z.array(
      z.enum([
        "LEGS",
        "CHEST",
        "SHOULDERS",
        "BACK",
        "BICEPS",
        "TRICEPS",
        "ABS",
        "FULL_BODY",
        "NECK",
      ])
    ),
  })
  .passthrough();
const ExerciseFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    name: z.string().optional(),
    muscleGroupList: z
      .array(
        z.enum([
          "LEGS",
          "CHEST",
          "SHOULDERS",
          "BACK",
          "BICEPS",
          "TRICEPS",
          "ABS",
          "FULL_BODY",
          "NECK",
        ])
      )
      .optional(),
  })
  .passthrough();
const CycleCreateRequest = z
  .object({
    traineeId: z.number().int().optional(),
    name: z.string().min(0).max(255),
  })
  .passthrough();
const CycleFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    authorId: z.number().int().optional(),
    traineeId: z.number().int().optional(),
    name: z.string().optional(),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  })
  .passthrough();
const CoachClientCreateRequest = z
  .object({ coachId: z.number().int(), clientId: z.number().int() })
  .passthrough();
const CoachClientFilterRequest = z
  .object({
    page: z.number().int(),
    size: z.number().int(),
    sortBy: z.string(),
    sortDirection: z.string().regex(/ASC|DESC|asc|desc/),
    coachId: z.number().int().optional(),
    clientId: z.number().int().optional(),
  })
  .passthrough();
const SignUpRequest = z
  .object({
    email: z.string(),
    password: z.string().min(4).max(2147483647),
    matchingPassword: z.string(),
  })
  .passthrough();
const LocalAuthenticationRequest = z
  .object({ email: z.string(), password: z.string() })
  .passthrough();

export const schemas = {
  WorkoutUpdateRequest,
  WorkoutExerciseCreateRequest,
  WorkoutExerciseUpdateRequest,
  BatchUpdateRequestWorkoutExerciseUpdateRequest,
  WorkoutExerciseSetCreateRequest,
  WorkoutExerciseSetUpdateRequest,
  BatchUpdateRequestWorkoutExerciseSetUpdateRequest,
  WeekCreateRequest,
  WeekUpdateRequest,
  BatchUpdateRequestWeekUpdateRequest,
  WeekWorkoutUpdateRequest,
  GoalUpdateRequest,
  CycleUpdateRequest,
  WorkoutCreateRequest,
  WorkoutFilterRequest,
  WorkoutExerciseFilterRequest,
  WorkoutExerciseSetFilterRequest,
  WeekFilterRequest,
  WeekWorkoutCreateRequest,
  WeekWorkoutFilterRequest,
  TagCreateRequest,
  TagFilterRequest,
  ProfileFilterRequest,
  GoalCreateRequest,
  GoalFilterRequest,
  ExerciseCreateRequest,
  ExerciseFilterRequest,
  CycleCreateRequest,
  CycleFilterRequest,
  CoachClientCreateRequest,
  CoachClientFilterRequest,
  SignUpRequest,
  LocalAuthenticationRequest,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/auth/sign-in",
    alias: "signInLocal",
    description: `Authenticates user using email and password. Returns a JWT token and user info on success.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: LocalAuthenticationRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid request or credentials`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized – incorrect email or password`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/auth/sign-up",
    alias: "signUp",
    description: `Registers a new user account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SignUpRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Validation failed – missing or invalid fields`,
        schema: z.void(),
      },
      {
        status: 409,
        description: `Email is already in use`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/clone/cycle/:id",
    alias: "cloneCycle",
    description: `Creates a new cycle by cloning an existing one identified by its ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Cycle not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/clone/workout-to-week-workout",
    alias: "cloneWorkoutToWeekWorkout",
    description: `Clones an existing workout and creates a new WeekWorkout instance from it.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WeekWorkoutCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid request`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/coach-clients",
    alias: "createCoachClient",
    description: `Creates a new relationship between a coach and a client based on the provided input.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CoachClientCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Coach or Client not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/coach-clients/:id",
    alias: "getCoachClientById",
    description: `Retrieves a specific coach-client relationship by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/coach-clients/filter",
    alias: "filterCoachClients",
    description: `Returns a paginated list of coach-client relationships that match the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CoachClientFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/cycles",
    alias: "createCycle",
    description: `Creates a new training cycle based on the provided input data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CycleCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/cycles/:id",
    alias: "getCycleById",
    description: `Retrieves a specific training cycle by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Cycle not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/cycles/:id",
    alias: "updateCycle",
    description: `Updates a specific training cycle identified by its ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CycleUpdateRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Cycle not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/cycles/:id",
    alias: "deleteCycle",
    description: `Deletes a training cycle by its ID and returns the ID of the deleted cycle.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Cycle not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/cycles/filter",
    alias: "filterCycles",
    description: `Returns a paginated list of training cycles that match the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CycleFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/enums/muscle-groups",
    alias: "getMuscleGroups",
    description: `Returns a list of available muscle groups.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/enums/weight-units",
    alias: "getWeightUnits",
    description: `Returns a list of supported weight units.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/enums/workout-exercise-set-types",
    alias: "getWorkoutExerciseSetTypes",
    description: `Returns a list of set types for workout exercises.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/enums/workout-exercise-types",
    alias: "getWorkoutExerciseTypes",
    description: `Returns a list of types of workout exercises.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/enums/workout-levels",
    alias: "getWorkoutLevels",
    description: `Returns a list of possible workout levels.`,
    requestFormat: "json",
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/exercises",
    alias: "createExercise",
    description: `Creates a new exercise using the provided input data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ExerciseCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/exercises/:id",
    alias: "getExerciseById",
    description: `Retrieves a specific exercise by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Exercise not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/exercises/:id",
    alias: "deleteExercise",
    description: `Deletes an exercise by its ID and returns the ID of the deleted exercise.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Exercise not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/exercises/filter",
    alias: "filterExercises",
    description: `Returns a paginated list of exercises matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ExerciseFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/goals",
    alias: "createGoal",
    description: `Creates a new training goal using the provided input data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoalCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/goals/:id",
    alias: "getGoalById",
    description: `Retrieves a specific goal by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Goal not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/goals/:id",
    alias: "updateGoal",
    description: `Updates a specific goal identified by its ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ text: z.string().min(0).max(1000) }).passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Goal not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/goals/:id",
    alias: "deleteGoal",
    description: `Deletes a goal by its ID and returns the ID of the deleted goal.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Goal not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/goals/:id/trigger-achieved",
    alias: "triggerAchieved",
    description: `Toggles a goal achieved attribute and returns the updated goal.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Goal not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/goals/filter",
    alias: "filterGoals",
    description: `Returns a paginated list of goals matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoalFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/profiles/:id",
    alias: "getProfileById",
    description: `Retrieves a specific profile by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Profile not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/profiles/:id",
    alias: "deleteProfile",
    description: `Deletes a profile by its ID and returns the ID of the deleted profile.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Profile not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/profiles/filter",
    alias: "filterProfiles",
    description: `Returns a paginated list of user profiles matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ProfileFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/profiles/profile-picture",
    alias: "uploadProfilePicture",
    description: `Uploads a new profile picture and returns the file url.`,
    requestFormat: "form-data",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ multipartFile: z.instanceof(File) }).passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid file upload`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 413,
        description: `File too large`,
        schema: z.void(),
      },
      {
        status: 415,
        description: `Unsupported media type`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/tags",
    alias: "createTag",
    description: `Creates a new tag with the given data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z.object({ name: z.string() }).passthrough(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/tags/:id",
    alias: "deleteTag",
    description: `Deletes a tag by its ID and returns the ID of the deleted tag.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/tags/filter",
    alias: "filterTags",
    description: `Returns a paginated list of tags matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: TagFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/users/:id",
    alias: "getUserById",
    description: `Retrieves a user by their unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `User not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/week-workouts",
    alias: "createWeekWorkout",
    description: `Creates a new week workout entity with the given request data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WeekWorkoutCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid request body`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/week-workouts/:id",
    alias: "getWeekWorkoutById",
    description: `Retrieves a single week workout based on its unique identifier.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/week-workouts/:id",
    alias: "updateWeekWorkout",
    description: `Updates an existing week workout entity based on its ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: z
          .object({ dayOfTheWeek: z.number().int().gte(1).lte(7) })
          .passthrough(),
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid request body`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/week-workouts/:id",
    alias: "deleteWeekWorkout",
    description: `Deletes the week workout with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/week-workouts/:id/trigger-completed",
    alias: "triggerCompleted_2",
    description: `Toggles the &#x27;completed&#x27; state of the week workout with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/week-workouts/filter",
    alias: "filterWeekWorkouts",
    description: `Returns a paginated list of week workouts matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WeekWorkoutFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid request body`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/weeks",
    alias: "createWeek",
    description: `Creates a new week with the provided data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WeekCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/weeks/:id",
    alias: "getWeekById",
    description: `Retrieves a specific week by its unique ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/weeks/:id",
    alias: "deleteWeek",
    description: `Deletes a week by its ID and returns the ID of the deleted week.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/weeks/:id/trigger-completed",
    alias: "triggerCompleted_1",
    description: `Toggles the completed status of the week identified by the given ID. The method flips the current completed state to its opposite.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Week not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/weeks/batch-update",
    alias: "batchUpdateWeeks",
    description: `Batch updates multiple weeks with the provided data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BatchUpdateRequestWeekUpdateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/weeks/filter",
    alias: "filterWeeks",
    description: `Returns a paginated list of weeks matching the provided filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WeekFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workout-exercise-sets",
    alias: "createWorkoutExerciseSet",
    description: `Creates a new workout exercise set from the provided data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutExerciseSetCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Validation failed`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/workout-exercise-sets/:id",
    alias: "getWorkoutExerciseSetById",
    description: `Returns the workout exercise set with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/workout-exercise-sets/:id",
    alias: "deleteWorkoutExerciseSet",
    description: `Deletes the workout exercise set with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "patch",
    path: "/workout-exercise-sets/:id/trigger-completed",
    alias: "triggerCompleted",
    description: `Toggles the &#x27;completed&#x27; state of the workout exercise set with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/workout-exercise-sets/batch-update",
    alias: "batchUpdateWorkoutExerciseSets",
    description: `Updates multiple workout exercise sets in a single request.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BatchUpdateRequestWorkoutExerciseSetUpdateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Validation failed`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workout-exercise-sets/filter",
    alias: "filterWorkoutExerciseSets",
    description: `Returns a paginated list of workout exercise sets matching the filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutExerciseSetFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workout-exercises",
    alias: "createWorkoutExercise",
    description: `Creates and returns a new workout exercise.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutExerciseCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/workout-exercises/:id",
    alias: "getWorkoutExerciseById",
    description: `Returns the workout exercise with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Workout exercise not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/workout-exercises/:id",
    alias: "deleteWorkoutExercise",
    description: `Deletes a workout exercise by ID and returns the ID of the deleted entity.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Workout exercise not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/workout-exercises/batch-update",
    alias: "batchUpdateWorkoutExercises",
    description: `Updates multiple workout exercises in one request and returns updated results.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BatchUpdateRequestWorkoutExerciseUpdateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workout-exercises/filter",
    alias: "filterWorkoutExercises",
    description: `Returns a paginated list of workout exercises based on the filter criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutExerciseFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workouts",
    alias: "createWorkout",
    description: `Creates a new workout with the provided data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutCreateRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input data`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/workouts/:id",
    alias: "getWorkoutById",
    description: `Returns workout with given ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "put",
    path: "/workouts/:id",
    alias: "updateWorkout",
    description: `Updates an existing workout with the given ID and request data.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutUpdateRequest,
      },
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid input data`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "delete",
    path: "/workouts/:id",
    alias: "deleteWorkout",
    description: `Deletes the workout with the specified ID.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.number().int(),
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 404,
        description: `Workout not found`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
  {
    method: "post",
    path: "/workouts/filter",
    alias: "filterWorkouts",
    description: `Filters workouts based on the provided criteria.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WorkoutFilterRequest,
      },
    ],
    response: z.void(),
    errors: [
      {
        status: 400,
        description: `Invalid filter parameters`,
        schema: z.void(),
      },
      {
        status: 401,
        description: `Unauthorized`,
        schema: z.void(),
      },
      {
        status: 403,
        description: `Access denied`,
        schema: z.void(),
      },
      {
        status: 500,
        description: `Internal server error`,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
