import {z} from "zod"

export const workoutUpdateRequestSchema = z.object({
    id: z.number().nonnegative().int(),
    name: z.string(),
    levelKey: z.string(),
    description: z.string().max(1000).optional(),
    tagNames: z.set(z.string()).optional()
})

export type WorkoutUpdateRequest = z.infer<typeof workoutUpdateRequestSchema>