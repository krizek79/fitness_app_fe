import {UserResponse} from "../../schema/UserResponse.ts"

export type LoginParams = {
    token: string
    expiresAt: string
    user: UserResponse
}