import { EnumResponse } from "../../../schema/EnumResponse"
import { WorkoutDetailResponse } from "../../../schema/WorkoutResponse"

export type WorkoutDetailParams = {
    workout: WorkoutDetailResponse | null,
    workoutLevels: EnumResponse[]
}