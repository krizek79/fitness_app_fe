import { WorkoutResponse } from './../schema/WorkoutResponse'
import { useContext, useEffect, useState } from "react"
import workoutApi from "../api/WorkoutApi"
import { AuthContext } from "../components/security/AuthContext"
import { toast } from 'sonner'
import { WorkoutFilterRequest } from "../schema/WorkoutFilterRequest"
import { AxiosError, AxiosResponse } from 'axios'
import { PageResponse } from '../schema/PageResponse'

export default function useHome(page: number) {
    
    const { logout } = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(false)
    const [workouts, setWorkouts] = useState<WorkoutResponse[]>([])
    const DEFAULT_PAGE_SIZE = 10

    useEffect(() => {
        setLoading(true)
            
        const request: WorkoutFilterRequest = {
            page: page,
            size: DEFAULT_PAGE_SIZE,
            sortBy: "id",
            sortDirection: "DESC",
            name: null,
            levelKey: null,
            tagNameList: []
        }

        workoutApi.filterWorkouts(request)
            .then((response: AxiosResponse<PageResponse<WorkoutResponse>>) => {
                setWorkouts((prevWorkouts) => {
                    return [...new Set([...prevWorkouts, ...response.data.results])]
                })
                setHasMore(calculateHasMore(response.data.totalElements, response.data.pageSize, response.data.pageNumber))
            })
            .catch((error: AxiosError) => {
                if (error.status === 401) {
                    logout()
                }
                console.log(error)
                toast.error("Oops... Something went wrong.")
            })
            .finally(() => setLoading(false))
    }, [logout, page])

    function calculateHasMore(totalElements: number, pageSize: number, pageNumber: number) {
        const lastPage = Math.ceil(totalElements / pageSize)
        return pageNumber + 1 < lastPage
    }

    return { workouts, loading, hasMore }
}