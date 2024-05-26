import useWorkout from "../../hook/useWorkout.ts"
import {useEffect, useState} from "react"
import GoBackButton from "../util/GoBackButton.tsx"

export default function Workout() {

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
                    {loading && <>Loading...</>}
                    {workout &&
                        <div className={"flex flex-wrap gap-x-3 text-2xl"}>
                            <span className={"text-text font-bold"}>
                                {workout.name}
                            </span>
                            {workout.levelValue &&
                                <span className={"text-secondary font-normal"}>
                                    ({workout.levelValue})
                                </span>
                            }
                        </div>
                    }
                </div>
            </div>
        </>
    )
}