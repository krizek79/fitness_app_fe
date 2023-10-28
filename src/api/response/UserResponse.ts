import {ProfileResponse} from "./ProfileResponse.ts";

export type UserResponse = {
    id: number,
    email: string,
    roles: Set<string>
    profileResponse: ProfileResponse
}