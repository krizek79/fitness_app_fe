import { EnumResponse } from "./../schema/EnumResponse"
import axios from "axios"
import { useContext, useCallback, useState, useEffect } from "react"
import { AuthContext } from "../components/security/AuthContext"
import enumApi from "../api/EnumApi"
import { toast } from "sonner"

export const useEnum = () => {
    const { logout } = useContext(AuthContext)

    const fetchEnumData = useCallback(
        async (
            fetchFunction: () => Promise<{ data: EnumResponse[] }>
        ): Promise<EnumResponse[]> => {
            try {
                const response = await fetchFunction()
                return response.data
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.status === 401) {
                        logout()
                    }
                    console.log(error)
                    toast.error("Oops... Something went wrong.")
                } else {
                    console.error("An unexpected error occurred:", error)
                }
                return []
            }
        },
        [logout]
    )

    const fetchMuscleGroups = useCallback((): Promise<EnumResponse[]> => {
        return fetchEnumData(enumApi.getMuscleGroups)
    }, [fetchEnumData])

    const fetchWorkoutLevels = useCallback((): Promise<EnumResponse[]> => {
        return fetchEnumData(enumApi.getWorkoutLevels)
    }, [fetchEnumData])

    return { fetchMuscleGroups, fetchWorkoutLevels }
}

export const useGetMuscleGroups = () => {
    const { fetchMuscleGroups } = useEnum()
    const [muscleGroups, setMuscleGroups] = useState<EnumResponse[]>([])

    useEffect(() => {
        const getMuscleGroups = async () => {
            try {
                const groups = await fetchMuscleGroups()
                setMuscleGroups(groups)
            } catch (error) {
                console.error("Error fetching muscle groups:", error)
            }
        }

        getMuscleGroups()
    }, [fetchMuscleGroups])

    return { muscleGroups }
}

export const useGetWorkoutLevels = () => {
    const { fetchWorkoutLevels } = useEnum()
    const [workoutLevels, setWorkoutLevels] = useState<EnumResponse[]>([])

    useEffect(() => {
        const getWorkoutLevels = async () => {
            try {
                const levels = await fetchWorkoutLevels()
                setWorkoutLevels(levels)
            } catch (error) {
                console.error("Error fetching workout levels:", error)
            }
        }

        getWorkoutLevels()
    }, [fetchWorkoutLevels])

    return { workoutLevels }
}
