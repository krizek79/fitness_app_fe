import {UserResponse} from "../../api/response/UserResponse.ts";

export type LoginParams = {
    token: string
    expiresAt: string
    user: UserResponse
}