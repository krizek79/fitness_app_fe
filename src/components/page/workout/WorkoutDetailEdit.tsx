import { useRef, ChangeEvent, FocusEvent } from "react"
import GoBackButton from "../../util/GoBackButton"
import Loading from "../../util/Loading"
import { useGetWorkout, useUpdateWorkout } from "../../../hook/useWorkout"
import { useGetWorkoutLevels } from "../../../hook/useEnum"
import {
    WorkoutUpdateRequest,
    workoutUpdateRequestSchema,
} from "../../../schema/WorkoutUpdateRequest"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"

export default function WorkoutDetailEdit() {
    const { getWorkoutLoading, workout } = useGetWorkout()
    const { updateWorkoutLoading, updateWorkout } = useUpdateWorkout()
    const { workoutLevels } = useGetWorkoutLevels()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<WorkoutUpdateRequest>({
        resolver: zodResolver(workoutUpdateRequestSchema),
    })

    const handleTextareaClick = () => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }

    const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target
        textarea.style.height = "auto"
        textarea.style.height = `${textarea.scrollHeight}px`
    }

    const handleTextareaBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
        const textarea = e.target
        textarea.style.height = "auto"
        textarea.rows = 1
    }

    function onSubmit(data: WorkoutUpdateRequest) {
        updateWorkout(data)
        reset()
    }

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
                    <TabGroup className={"border-b"}>
                        <TabList className={"flex w-full justify-between"}>
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
                                <form
                                    className={"flex flex-col gap-y-6 w-full"}
                                >
                                    {getWorkoutLoading && <Loading />}
                                    {workout && (
                                        <div
                                            className={"flex flex-col gap-y-3"}
                                        >
                                            <div className="flex flex-col">
                                                <label
                                                    htmlFor="name"
                                                    className={
                                                        "text-base text-secondary"
                                                    }
                                                >
                                                    Name
                                                </label>
                                                <input
                                                    id={"name"}
                                                    name={"name"}
                                                    type={"text"}
                                                    className={
                                                        "w-full py-1.5 border-b-2 placeholder-transparent focus:outline-none " +
                                                        "focus:border-primary bg-background text-gray-500 focus:text-text"
                                                    }
                                                    value={workout.name}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="text-base text-secondary">
                                                    Level
                                                </label>
                                                <ul className="w-full py-1.5 flex flex-wrap flex-col gap-y-1.5 sm:flex-row sm:gap-x-6">
                                                    {workoutLevels &&
                                                        workoutLevels.map(
                                                            (level) => (
                                                                <li
                                                                    key={
                                                                        level.key
                                                                    }
                                                                    className="flex gap-x-3 items-center"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        id={
                                                                            level.key
                                                                        }
                                                                        name="level"
                                                                        value={
                                                                            level.key
                                                                        }
                                                                        className="w-5 h-5"
                                                                    />
                                                                    <label
                                                                        htmlFor={
                                                                            level.key
                                                                        }
                                                                        className="text-text"
                                                                    >
                                                                        {
                                                                            level.value
                                                                        }
                                                                    </label>
                                                                </li>
                                                            )
                                                        )}
                                                </ul>
                                            </div>
                                            <div className="flex flex-col">
                                                <label
                                                    htmlFor="description"
                                                    className={
                                                        "text-base text-secondary"
                                                    }
                                                >
                                                    Description
                                                </label>
                                                <textarea
                                                    id={"description"}
                                                    name={"description"}
                                                    ref={textareaRef}
                                                    className={
                                                        "w-full py-1.5 border-b-2 placeholder-transparent focus:outline-none " +
                                                        "focus:border-primary bg-background text-gray-500 focus:text-text " +
                                                        "overflow-y-hidden resize-none"
                                                    }
                                                    value={workout.description}
                                                    rows={1}
                                                    onClick={
                                                        handleTextareaClick
                                                    }
                                                    onChange={
                                                        handleTextareaChange
                                                    }
                                                    onBlur={handleTextareaBlur}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        disabled={true}
                                        className={
                                            "flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                                            "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                                            "duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        }
                                    >
                                        Save
                                    </button>
                                </form>
                            </TabPanel>
                            <TabPanel key={"exercises"} className={"w-full"}>
                                <form
                                    className={"flex flex-col gap-y-6 w-full"}
                                >
                                    Something...
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </>
    )
}
