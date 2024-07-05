import {z} from "zod"

export const tagCreateRequestSchema = z.object({
    name: z.string().min(1)
})

export type TagCreateRequest = z.infer<typeof tagCreateRequestSchema>