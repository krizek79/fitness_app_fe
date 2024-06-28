import { TagResponse } from "./TagResponse"

export type WorkoutDetailResponse = {
    id: string,
    name: string,
    authorName: string,
    tagResponseList: TagResponse[],
    levelValue: string,
    description: string | null
}