import { WorkoutCreateRequest } from "../schema/WorkoutCreateRequest.ts"
import workoutApi from "../api/WorkoutApi.ts"
import { useLocation, useNavigate } from "react-router-dom"
import { Paths } from "../constants/Paths.ts"
import { WorkoutDetailResponse } from "../schema/WorkoutResponse.ts"
import { useContext, useEffect, useState } from "react"
import axios, { AxiosError, AxiosResponse } from "axios"
import { AuthContext } from "../components/security/AuthContext.ts"
import { toast } from "sonner"
import { PageResponse } from "../schema/PageResponse.ts"
import { WorkoutFilterRequest } from "../schema/WorkoutFilterRequest.ts"
import { WorkoutUpdateRequest } from "../schema/WorkoutUpdateRequest.ts"

export const useFilterWorkouts = (page: number) => {
    
    const { logout } = useContext(AuthContext)
    const [filterWorkoutsLoading, setFilterWorkoutsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [workouts, setWorkouts] = useState<WorkoutDetailResponse[]>([])
    const DEFAULT_PAGE_SIZE = 10

    useEffect(() => {
        setFilterWorkoutsLoading(true)

        const request: WorkoutFilterRequest = {
            page: page,
            size: DEFAULT_PAGE_SIZE,
            sortBy: "id",
            sortDirection: "DESC",
            name: null,
            levelKey: null,
            tagNameList: [],
        }

        workoutApi
            .filterWorkouts(request)
            .then(
                (
                    response: AxiosResponse<PageResponse<WorkoutDetailResponse>>
                ) => {
                    setWorkouts((prevWorkouts) => {
                        return [
                            ...new Set([
                                ...prevWorkouts,
                                ...response.data.results,
                            ]),
                        ]
                    })
                    setHasMore(
                        calculateHasMore(
                            response.data.totalElements,
                            response.data.pageSize,
                            response.data.pageNumber
                        )
                    )
                }
            )
            .catch((error: AxiosError) => {
                if (error.status === 401) {
                    logout()
                }
                console.log(error)
                toast.error("Oops... Something went wrong.")
            })
            .finally(() => setFilterWorkoutsLoading(false))
    }, [logout, page])

    function calculateHasMore(
        totalElements: number,
        pageSize: number,
        pageNumber: number
    ) {
        const lastPage = Math.ceil(totalElements / pageSize)
        return pageNumber + 1 < lastPage
    }

    return { workouts, filterWorkoutsLoading, hasMore }
}

export const useGetWorkout = () => {

    const { logout } = useContext(AuthContext)
    const [getWorkoutLoading, setGetWorkoutLoading] = useState(false)
    const urlParams = new URLSearchParams(window.location.search)
    const workoutId = urlParams.get("id")
    const [workout, setWorkout] = useState<WorkoutDetailResponse | null>(null)
    const location = useLocation()

    useEffect(() => {
        setGetWorkoutLoading(true)
        workoutApi
            .getWorkout(workoutId)
            .then((response: AxiosResponse<WorkoutDetailResponse>) => {
                setWorkout(response.data)
            })
            .catch((error: AxiosError) => {
                if (error.response && error.response.status === 401) {
                    logout()
                }
                console.log(error)
                toast.error("Oops... Something went wrong.")
            })
            .finally(() => setGetWorkoutLoading(false))
    }, [workoutId, location.pathname, logout])

    return { getWorkoutLoading, workout }
}

export const useCreateWorkout = () => {

    const { logout } = useContext(AuthContext)
    const [createWorkoutLoading, setCreateWorkoutLoading] = useState(false)
    const navigate = useNavigate()

    const createWorkout = async (
        request: WorkoutCreateRequest,
        toggleOpen: () => void
    ) => {
        setCreateWorkoutLoading(true)
        try {
            const response = await workoutApi.createWorkout(request)
            if (response.status === 200) {
                toggleOpen()
                navigate(Paths.WORKOUT + `?id=${response.data.id}`)
            }
        } catch (error) {
            if (error === AxiosError) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.status === 401) {
                        logout()
                    }
                    console.log(error)
                    toast.error("Oops... Something went wrong.")
                } else {
                    console.error("An unexpected error occurred:", error)
                }
            }
        } finally {
            setCreateWorkoutLoading(false)
        }
    }

    return { createWorkoutLoading, createWorkout }
}

export const useUpdateWorkout = () => {

    const { logout } = useContext(AuthContext)
    const urlParams = new URLSearchParams(window.location.search)
    const workoutId = urlParams.get("id")
    const [updateWorkoutLoading, setUpdateWorkoutLoading] = useState(false)
    const navigate = useNavigate()

    const updateWorkout = async (request: WorkoutUpdateRequest) => {
        setUpdateWorkoutLoading(true)
        try {
            const response = await workoutApi.updateWorkout(workoutId, request)
            if (response.status === 200) {
                navigate(Paths.WORKOUT + `?id=${response.data.id}`)
            }
        } catch (error) {
            if (error === AxiosError) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.status === 401) {
                        logout()
                    }
                    console.log(error)
                    toast.error("Oops... Something went wrong.")
                } else {
                    console.error("An unexpected error occurred:", error)
                }
            }
        } finally {
            setUpdateWorkoutLoading(false)
        }
    }

    return { updateWorkoutLoading, updateWorkout }
}
