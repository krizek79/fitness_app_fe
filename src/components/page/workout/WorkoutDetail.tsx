import {useState} from "react"
import GoBackButton from "../../util/GoBackButton.tsx"
import Loading from "../../util/Loading.tsx"
import { useNavigate } from "react-router-dom"
import { Paths } from "../../../constants/Paths.ts"
import { useGetWorkout } from "../../../hook/useWorkout.ts"

export default function WorkoutDetail() {
    
    const navigate = useNavigate()
    const urlParams = new URLSearchParams(window.location.search)
    const workoutId = urlParams.get("id")
    const { getWorkoutLoading, workout } = useGetWorkout()
    const [descriptionShowMore, descriptionSetShowMore] = useState(false)

    const toggleDescriptionShowMore = () => {
        descriptionSetShowMore(prevShowMore => !prevShowMore)
    }

    const handleEdit = () => {
        return () => navigate(`${Paths.WORKOUT_EDIT}?id=${workoutId}`)
    }

    const description = workout?.description || ""
    const shortDescription = description.length > 100 ? description.slice(0, 100) + "..." : description

    return (
        <>
            <div className={"flex w-full justify-center px-0 md:px-6 min-h-full"}>
                <div
                    className={"flex flex-col px-6 gap-y-6 w-full md:w-3/4 lg:w-2/3"}
                >
                    <GoBackButton />
                    {getWorkoutLoading && <Loading />}
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
                            <div className={"flex flex-wrap gap-x-3 gap-y-3"}>
                                {workout.tagResponseList.length > 0 && (
                                    <div className="flex flex-col gap-y-1.5">
                                        <span className="text-text font-medium">Tags:</span>
                                        <div className={"flex flex-wrap gap-x-3 gap-y-3"}>
                                            {workout.tagResponseList.map((tag) => (
                                                <div
                                                    key={tag.id}
                                                    className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary " +
                                                    "bg-background"}
                                                >
                                                    {tag.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {workout.description && (
                                <div className="flex flex-col gap-y-1.5">
                                    <span className="text-text font-medium">Description:</span>
                                    <p className="text-secondary">
                                        {descriptionShowMore ? description : shortDescription}
                                        {description.length > 100 && (
                                            <span 
                                                className="text-text cursor-pointer hover:underline ml-2" 
                                                onClick={toggleDescriptionShowMore}
                                            >
                                                {descriptionShowMore ? "Show less" : "Show more"}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    }
                    <div className="flex flex-col md:flex-row gap-x-3 gap-y-3">
                        <button
                            onClick={handleEdit()}
                            className={"flex w-full justify-center gap-x-3 items-center border-2 px-6 py-1.5 border-primary " +
                                "transition ease-in-out hover:bg-accent duration-150"}
                        >
                            Edit
                        </button>
                        <button
                            className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                                "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                                "duration-150"}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}