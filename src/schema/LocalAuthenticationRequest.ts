import {z} from "zod"

export const localAuthenticationRequest = z.object({
    email: z.string().email(),
    password: z.string()
})

export type LocalAuthenticationRequest = z.infer<typeof localAuthenticationRequest>