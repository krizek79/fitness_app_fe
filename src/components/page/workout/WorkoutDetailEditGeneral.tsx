import { zodResolver } from "@hookform/resolvers/zod"
import { useRef, useEffect, ChangeEvent, FocusEvent } from "react"
import { useForm } from "react-hook-form"
import { useUpdateWorkout } from "../../../hook/useWorkout"
import BasicLabelInput from "../../util/BasicLabelInput"
import {
    WorkoutUpdateRequest,
    workoutUpdateRequestSchema,
} from "../../../schema/WorkoutUpdateRequest"
import { WorkoutDetailParams } from "./WorkoutDetailProps"
import CreateTag from "./CreateTag"

export default function WorkoutDetailEditGeneral(props: WorkoutDetailParams) {
    const workout = props.workout
    const workoutLevels = props.workoutLevels
    const { updateWorkout } = useUpdateWorkout()
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<WorkoutUpdateRequest>({
        resolver: zodResolver(workoutUpdateRequestSchema),
    })

    useEffect(() => {
        if (workout) {
            reset({
                name: workout.name,
                levelKey: workout.levelValue,
                description: workout.description || "",
                tagNames: workout.tagResponseList.map((tag) => tag.name),
            })
        }
    }, [workout, reset])

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
        setValue("description", e.target.value)
    }

    const handleTextareaBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
        const textarea = e.target
        textarea.style.height = "auto"
        textarea.rows = 1
    }

    const onSubmitEditGeneral = (data: WorkoutUpdateRequest) => {
        updateWorkout(data)
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmitEditGeneral)}
            className={"flex flex-col gap-y-6 w-full"}
        >
            {workout && (
                <div className={"flex flex-col gap-y-3"}>
                    <div className="flex flex-col">
                        <BasicLabelInput
                            register={register}
                            id={"name"}
                            name={"name"}
                            type={"text"}
                            label={"Workout name"}
                            errors={errors}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-base text-secondary">
                            Level
                        </label>
                        <ul className="w-full pt-1.5 flex flex-wrap flex-col gap-y-1.5 sm:flex-row sm:gap-x-6">
                            {workoutLevels &&
                                workoutLevels.map((level) => (
                                    <li
                                        key={level.key}
                                        className="flex gap-x-3 items-center"
                                    >
                                        <input
                                            type="radio"
                                            id={level.key}
                                            {...register("levelKey")}
                                            defaultChecked={
                                                level.value ===
                                                workout.levelValue
                                            }
                                            value={level.key}
                                            className="w-5 h-5"
                                        />
                                        <label
                                            htmlFor={level.key}
                                            className="text-text"
                                        >
                                            {level.value}
                                        </label>
                                    </li>
                                ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-y-1.5">
                        <span className="text-secondary font-medium">Tags:</span>
                        <div className={"flex flex-wrap gap-x-3 gap-y-3"}>
                            <CreateTag />
                            {workout.tagResponseList.map((tag) => (
                                <div
                                    key={tag.id}
                                    className={
                                        "flex flex-shrink-0 gap-x-3 px-3 py-1.5 border border-primary text-secondary " +
                                        "bg-background items-center"
                                    }
                                >
                                    <span className="text-sm">{tag.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {}}
                                        className="text-sm font-medium"
                                    >
                                        &#10006;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <label
                            htmlFor="description"
                            className={"text-base text-secondary"}
                        >
                            Description
                        </label>
                        <textarea
                            id={"description"}
                            {...register("description")}
                            ref={textareaRef}
                            defaultValue={workout.description ?? ""}
                            className={
                                "w-full py-1.5 border-b-2 placeholder-transparent focus:outline-none " +
                                "focus:border-primary bg-background text-gray-500 focus:text-text " +
                                "overflow-y-hidden resize-none"
                            }
                            rows={1}
                            onClick={handleTextareaClick}
                            onChange={handleTextareaChange}
                            onBlur={handleTextareaBlur}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm pt-3">
                                {errors.description.message as string}
                            </p>
                        )}
                    </div>
                </div>
            )}
            <button
                type="submit"
                disabled={isSubmitting}
                className={
                    "flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                    "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                    "duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                }
            >
                Save
            </button>
        </form>
    )
}
