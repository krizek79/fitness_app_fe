import { WorkoutDetailResponse } from "../../../schema/WorkoutResponse";

interface WorkoutPreviewProps {
    workout: WorkoutDetailResponse;
}

export default function WorkoutPreview({ workout }: WorkoutPreviewProps) {
    return (
        <a
            href={`/workout?id=${workout.id}`}
            className={"w-full px-3 md:px-6 py-6 flex hover:bg-accent hover:cursor-pointer " +
                "shadow-sm transition duration-150"}
        >
            <div className={"w-full flex flex-col gap-y-3"}>
                {/*Name and difficulty*/}
                <div className={"flex flex-wrap gap-x-1.5 text-lg"}>
                    <span className={"text-text font-medium"}>
                        {workout.name}
                    </span>
                    {workout.levelValue && (
                        <span className={"text-secondary font-normal"}>
                            ({workout.levelValue})
                        </span>
                    )}
                </div>
                {/*Tags*/}
                {workout.tagResponseList.length > 0 && (
                    <div className="flex flex-col gap-y-1.5">
                        <span className="text-text">Tags:</span>
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
        </a>
    )
}