import { useState } from "react";
import useHome from "../../../hook/useHome.ts";
import CreateWorkout from "./CreateWorkout.tsx";
import WorkoutPreview from "./WorkoutPreview.tsx";
import ShowMoreButton from "../../util/ShowMoreButton.tsx";
import Loading from "../../util/Loading.tsx";


export default function Home() {

    const [page, setPage] = useState(0)
    const { loading, workouts, hasMore } = useHome(page)

    function handleShowMore() {
        setPage((prevPageNumber: number) => prevPageNumber + 1)
    }

    return (
        <>
            <div className={"flex w-full justify-center px-0 md:px-6 min-h-full"}>
                <div
                    className={"flex flex-col px-6 gap-y-6 w-full md:w-3/4 lg:w-2/3 break-all"}
                >
                    <div className={"w-full"}>
                        <CreateWorkout />
                    </div>
                    <div className={"w-full grid gap-y-6 border-t-2 px-0 py-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}>
                        {workouts.map((workout) => (
                            <WorkoutPreview key={workout.id} workout={workout} />
                        ))}
                    </div>
                    {loading && <Loading />}
                    {hasMore && <ShowMoreButton handleShowMore={handleShowMore} />}
                </div>
            </div>
        </>
    )
}