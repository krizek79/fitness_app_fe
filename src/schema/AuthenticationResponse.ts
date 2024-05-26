import { UserResponse } from "./UserResponse.ts"

export type AuthenticationResponse = {
    token: string,
    expiresAt: Date,
    userResponse: UserResponse
}