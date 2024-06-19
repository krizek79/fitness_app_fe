import {WorkoutCreateRequest} from "../schema/WorkoutCreateRequest.ts"
import workoutApi from "../api/WorkoutApi.ts"
import {useLocation, useNavigate} from "react-router-dom"
import {Paths} from "../constants/Paths.ts"
import {WorkoutResponse} from "../schema/WorkoutResponse.ts"
import {useContext, useEffect, useState} from "react"
import {AxiosError, AxiosResponse} from "axios"
import { AuthContext } from "../components/security/AuthContext.ts"
import { toast } from "sonner"

export default function useWorkout() {

    const { logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const urlParams = new URLSearchParams(window.location.search)
    const workoutId = urlParams.get("id")
    const [loading, setLoading] = useState(true)
    const [workout, setWorkout] = useState<WorkoutResponse | null>(null)
    const location = useLocation()

    useEffect(() => {
        if (location.pathname === Paths.WORKOUT || location.pathname === Paths.WORKOUT_EDIT) {
            setLoading(true)
            workoutApi.getWorkout(workoutId)
                .then((response: AxiosResponse<WorkoutResponse>) => {
                    setWorkout(response.data)
                })
                .catch((error: AxiosError) => {
                    if (error.response && error.response.status === 401) {
                        logout()
                    }
                    console.log(error)
                    toast.error("Oops... Something went wrong.")
                })
                .finally(() => setLoading(false))
        }
    }, [workoutId, logout, location.pathname])

    const createWorkout = (request: WorkoutCreateRequest, toggleOpen: () => void) => {
        workoutApi.createWorkout(request)
            .then((response: AxiosResponse<WorkoutResponse>) => {
                if (response.status === 200) {
                    toggleOpen()
                    navigate(Paths.WORKOUT + `?id=${response.data.id}`)
                }
            })
            .catch((error: AxiosError) => {
                if (error.status === 401) {
                    logout()
                }
                console.log(error)
                toast.error("Oops... Something went wrong.")
            })
    }

    const handleEdit = () => {
        return () => navigate(`${Paths.WORKOUT_EDIT}?id=${workoutId}`)
    }

    return {loading, createWorkout, workout, handleEdit}
}