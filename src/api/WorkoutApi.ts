import axios from "axios"
import {WorkoutCreateRequest} from "../schema/WorkoutCreateRequest.ts"
import Cookies from "js-cookie";
import { WorkoutFilterRequest } from "../schema/WorkoutFilterRequest.ts";
import { WorkoutResponse } from "../schema/WorkoutResponse.ts";
import { PageResponse } from "../schema/PageResponse.ts";

const WORKOUT_API_BASE_URL = "http://localhost:8080/workouts"

export default new class WorkoutApi {

    filterWorkouts(request: WorkoutFilterRequest) {
        return axios.post<PageResponse<WorkoutResponse>>(`${WORKOUT_API_BASE_URL}/filter`, request, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }

    getWorkout(id: string | null) {
        return axios.get<WorkoutResponse>(WORKOUT_API_BASE_URL + `/${id}`, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }

    createWorkout(request: WorkoutCreateRequest) {
        return axios.post<WorkoutResponse>(WORKOUT_API_BASE_URL, request, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }
}