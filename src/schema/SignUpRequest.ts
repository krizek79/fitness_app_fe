import {z} from "zod";

export const signUpRequest = z.object({
    email: z.string().email(),
    name: z.string()
        .min(2, {message: "Name shouldn't be less than 2 or more than 64 characters long"})
        .max(64, {message: "Name shouldn't be less than 2 or more than 64 characters long"}),
    password: z.string().min(4, {
        message: "Password should be at least 4 characters long"
    }),
    matchingPassword: z.string()
}).refine(data => data.password === data.matchingPassword, {
    message: "Passwords must match",
    path: ["matchingPassword"]
})

export type SignUpRequest = z.infer<typeof signUpRequest>