import axios from "axios"
import Cookies from "js-cookie"
import { EnumResponse } from "../schema/EnumResponse.ts"

const ENUM_API_BASE_URL = "http://localhost:8080/enums"

export default new class EnumApi {

    getWorkoutLevels() {
        return axios.get<EnumResponse[]>(`${ENUM_API_BASE_URL}/workout-levels`, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }

    getMuscleGroups() {
        return axios.get<EnumResponse[]>(`${ENUM_API_BASE_URL}/muscle-groups`, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token")
            }
        })
    }
}