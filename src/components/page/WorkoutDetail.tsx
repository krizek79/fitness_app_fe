import useWorkout from "../../hook/useWorkout.ts"
import {useEffect, useState} from "react"
import GoBackButton from "../util/GoBackButton.tsx"
import Loading from "../util/Loading.tsx"

export default function WorkoutDetail() {

    const urlParams = new URLSearchParams(window.location.search)
    const workoutId = urlParams.get("id")
    const [loading, setLoading] = useState(true)
    const { workout, fetchWorkout } = useWorkout()

    useEffect(() => {
        if (workoutId) {
            setLoading(true)
            fetchWorkout(workoutId).then(() => setLoading(false))
        }
    }, [fetchWorkout, workoutId])

    return (
        <>
            <div className={"flex w-full justify-center px-0 md:px-6 min-h-full"}>
                <div
                    className={"flex flex-col px-6 gap-y-6 w-full md:w-3/4 lg:w-2/3"}
                >
                    <GoBackButton />
                    {loading && <Loading />}
                    {workout && 
                        <div className={"flex flex-col gap-y-3"}>
                            <div className="flex flex-col">
                                <span className={"text-text font-bold text-2xl"}>
                                    {workout.name} {workout.levelValue &&
                                        <span className={"text-secondary font-normal text-2xl"}>
                                            ({workout.levelValue})
                                        </span>
                                }
                                </span>
                                <div className="flex gap-x-1.5">
                                    <span className={"text-text font-medium"}>By </span>
                                    <a href="" className="text-primary hover:underline">{workout.authorName}</a>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}