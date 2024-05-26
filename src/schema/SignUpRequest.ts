import {z} from "zod";

export const signUpRequest = z.object({
    email: z.string().email(),
    password: z.string().min(4, {
        message: "Password should be at least 4 characters long"
    }),
    matchingPassword: z.string()
}).refine((data: { password: string; matchingPassword: string; }) => data.password === data.matchingPassword, {
    message: "Passwords must match",
    path: ["matchingPassword"]
})

export type SignUpRequest = z.infer<typeof signUpRequest>