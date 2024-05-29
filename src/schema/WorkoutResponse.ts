import { TagResponse } from "./TagResponse"

export type WorkoutResponse = {
    id: string,
    name: string,
    authorName: string,
    tagResponseList: TagResponse[],
    levelValue: string | null
}