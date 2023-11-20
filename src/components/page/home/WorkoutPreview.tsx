
export default function WorkoutPreview() {
    return (
        <div
            className={"w-full px-3 md:px-6 py-6 flex hover:bg-accent hover:cursor-pointer " +
                "shadow-sm transition duration-150"}
        >
            <div className={"w-full flex flex-col gap-y-3"}>
                {/*Name and difficulty*/}
                <div className={"flex flex-wrap gap-x-3 text-lg"}>
                    <span className={"text-text font-medium"}>
                        Hardcore chest workout
                    </span>
                    <span className={"text-secondary font-normal"}>(Intermediate)</span>
                </div>
                {/*Tags*/}
                <div className={"flex flex-wrap gap-x-3 gap-y-3"}>
                    <div className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary bg-background"}>
                        some tag
                    </div>
                    <div className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary bg-background"}>
                        light weight
                    </div>
                    <div className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary bg-background"}>
                        coleman
                    </div>
                    <div className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary bg-background"}>
                        light weight baby
                    </div>
                    <div className={"flex-shrink-0 text-sm px-3 py-1.5 border border-primary text-secondary bg-background"}>
                        ez
                    </div>
                </div>
            </div>
        </div>
    )
}