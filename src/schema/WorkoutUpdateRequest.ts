import { z } from "zod"

export const workoutUpdateRequestSchema = z.object({
    name: z.string(),
    levelKey: z.string(),
    description: z.string().max(1000).optional(),
    tagNames: z.array(z.string()).optional()
})

export type WorkoutUpdateRequest = z.infer<typeof workoutUpdateRequestSchema>
