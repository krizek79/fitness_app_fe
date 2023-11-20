import {WorkoutCreateRequest} from "../schema/WorkoutCreateRequest.ts"
import workoutApi from "../api/WorkoutApi.ts"
import {useNavigate} from "react-router-dom"
import {Paths} from "../constants/Paths.ts"
import {WorkoutResponse} from "../schema/WorkoutResponse.ts"
import {useCallback, useState} from "react";
import {AxiosError} from "axios";

export default function useWorkout() {

    const navigate = useNavigate()
    const [workout, setWorkout] = useState<WorkoutResponse | null>(null)

    const fetchWorkout = useCallback(async (id: string | null) => {
        try {
            if (id) {
                const response = await workoutApi.getWorkout(id)
                setWorkout(response.data)
            }
        } catch (error) {
            console.error((error as AxiosError).response?.data)
        }
    }, [])

    const createWorkout = (request: WorkoutCreateRequest, toggleOpen: () => void) => {
        workoutApi.createWorkout(request)
            .then(response => {
                if (response.status === 200) {
                    toggleOpen()
                    navigate(Paths.WORKOUT + `?id=${response.data.id}`)
                }
            })
            .catch(error => {
                if (error.response?.data?.message) {
                    console.log(error)
                }
            })
    }

    return {createWorkout, workout, fetchWorkout}
}