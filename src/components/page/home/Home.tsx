import CreateWorkout from "./CreateWorkout.tsx";
import WorkoutPreview from "./WorkoutPreview.tsx";


export default function Home() {

    return (
        <>
            <div className={"flex w-full justify-center px-0 md:px-6 min-h-full"}>
                <div
                    className={"flex flex-col px-6 gap-y-6 w-full md:w-3/4 lg:w-2/3 break-all"}
                >
                    <div className={"w-full"}>
                        <CreateWorkout />
                    </div>
                    <div className={"w-full flex flex-col gap-y-6 border-t-2 px-0 py-6"}>
                        <WorkoutPreview />
                        <WorkoutPreview />
                        <WorkoutPreview />
                        <WorkoutPreview />
                    </div>
                </div>
            </div>
        </>
    )
}