import GoBackButton from "../../util/GoBackButton"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"
import WorkoutDetailEditGeneral from "./WorkoutDetailEditGeneral"
import { useGetWorkout } from "../../../hook/useWorkout"
import Loading from "../../util/Loading"

export default function WorkoutDetailEdit() {
    const { getWorkoutLoading, workout } = useGetWorkout()

    return (
        <>
            <div
                className={"flex w-full justify-center px-0 md:px-6 min-h-full"}
            >
                <div
                    className={
                        "flex flex-col px-6 gap-y-6 w-full md:w-3/4 lg:w-2/3"
                    }
                >
                    <GoBackButton />
                    <TabGroup>
                        <TabList
                            className={"flex w-full justify-between border-b"}
                        >
                            <Tab
                                key={"general"}
                                className="py-3 text-text text-lg w-full flex justify-center focus:outline-none data-[selected]:bg-accent data-[hover]:bg-accent transition duration-150"
                            >
                                General
                            </Tab>
                            <Tab
                                key={"exercises"}
                                className="py-3 text-text text-lg w-full flex justify-center focus:outline-none data-[selected]:bg-accent data-[hover]:bg-accent transition duration-150"
                            >
                                Exercises
                            </Tab>
                        </TabList>
                        <TabPanels className={"w-full py-6"}>
                            <TabPanel key={"general"} className={"w-full"}>
                                {getWorkoutLoading ? (
                                    <Loading />
                                ) : (
                                    <WorkoutDetailEditGeneral
                                        workout={workout}
                                    />
                                )}
                            </TabPanel>
                            <TabPanel key={"exercises"} className={"w-full"}>
                                <form
                                    className={"flex flex-col gap-y-6 w-full"}
                                >
                                    Not implemented yet...
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </>
    )
}
