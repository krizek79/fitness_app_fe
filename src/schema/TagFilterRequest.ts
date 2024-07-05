import { z } from "zod"

export const tagFilterRequest = z.object({
    page: z.number().min(1),
    size: z.number().min(1),
    sortBy: z.string().default("name"),
    sortDirection: z.enum(["ASC", "DESC"]),
    name: z.string().optional(),
})

export type TagFilterRequest = z.infer<typeof tagFilterRequest>
