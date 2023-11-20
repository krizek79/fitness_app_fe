import {z} from "zod"

export const workoutCreateRequest = z.object({
    name: z.string()
        .min(1, {message: "Name should be at least 1 character long"})
        .max(64, {message: "Name should be max 64 characters long"})
})

export type WorkoutCreateRequest = z.infer<typeof workoutCreateRequest>