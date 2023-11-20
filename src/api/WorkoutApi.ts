import axios from "axios"
import {WorkoutCreateRequest} from "../schema/WorkoutCreateRequest.ts"
import Cookies from "js-cookie";

const WORKOUT_API_BASE_URL = "http://localhost:8080/workouts"

export default new class WorkoutApi {

    filterWorkouts() {
        return axios.post(WORKOUT_API_BASE_URL + "/filter", {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }

    getWorkout(id: string | null) {
        return axios.get(WORKOUT_API_BASE_URL + `/${id}`, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }

    createWorkout(request: WorkoutCreateRequest) {
        return axios.post(WORKOUT_API_BASE_URL, request, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }
}