import {ProfileResponse} from "./ProfileResponse.ts";

export type UserResponse = {
    id: number,
    email: string,
    roles: [string]
    profileResponse: ProfileResponse
}