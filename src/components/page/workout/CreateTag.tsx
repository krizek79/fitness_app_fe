import {
    Transition,
    Dialog,
    TransitionChild,
    DialogPanel,
} from "@headlessui/react"
import { Fragment, useState } from "react"
import {
    TagCreateRequest,
    tagCreateRequestSchema,
} from "../../../schema/TagCreateRequest"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCreateTag, useFilterTags } from "../../../hook/useTag"

export default function CreateTag() {
    
    const [open, setOpen] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<TagCreateRequest>({
        resolver: zodResolver(tagCreateRequestSchema),
    })
    const name = watch("name")
    const { tags } = useFilterTags(name)
    const { createTag } = useCreateTag()

    function toggleOpen() {
        setOpen(!open)
    }

    async function onSubmit(data: TagCreateRequest) {
        await createTag(data)
        reset()
    }

    function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        handleSubmit(onSubmit)()
    }

    return (
        <>
            <button
                type="button"
                onClick={toggleOpen}
                className={
                    "flex justify-center border px-6 py-1.5 transition ease-in-out bg-gradient-to-r " +
                    " from-primary to-accent hover:bg-gradient-to-br duration-150"
                }
            >
                Add
            </button>

            <Transition show={open} as={Fragment}>
                <Dialog as="div" className={"relative z-10"} onClose={setOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className={
                                "fixed inset-0 bg-black bg-opacity-75 transition-opacity"
                            }
                        />
                    </TransitionChild>

                    <div className={"fixed inset-0 overflow-y-auto px-3"}>
                        <div
                            className={
                                "flex min-h-full items-center justify-center"
                            }
                        >
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-50 transform translate-y-full"
                                enterTo="opacity-100 scale-100 transform translate-y-0"
                                leave="ease-in duration-300"
                                leaveFrom="opacity-100 scale-100 transform translate-y-0"
                                leaveTo="opacity-0 scale-50 transform translate-y-full"
                            >
                                <DialogPanel
                                    className={
                                        "transform overflow-hidden transition-all w-full px-6 py-12 " +
                                        "bg-background shadow-sm md:max-w-xl flex flex-col gap-y-6 max-h-[80vh]"
                                    }
                                >
                                    <form
                                        onSubmit={handleFormSubmit}
                                        className={
                                            "w-full flex flex-col h-full"
                                        }
                                    >
                                        <div className="flex flex-col">
                                            <div className="w-full flex flex-row justify-between">
                                                <div
                                                    className={
                                                        "flex flex-col w-full"
                                                    }
                                                >
                                                    <input
                                                        type="search"
                                                        placeholder="Search / create new"
                                                        {...register("name")}
                                                        className={
                                                            "h-12 w-full border-b-2 focus:outline-none focus:border-primary " +
                                                            " bg-background text-text [&::-webkit-search-cancel-button]:hidden"
                                                        }
                                                    />
                                                </div>
                                                <button
                                                    type={"submit"}
                                                    disabled={isSubmitting}
                                                    className={
                                                        "flex justify-center gap-x-3 items-center border px-6 " +
                                                        "py-1 transition ease-in-out bg-gradient-to-r from-text " +
                                                        "to-secondary hover:bg-gradient-to-br duration-150 " +
                                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            "text-background"
                                                        }
                                                    >
                                                        Add
                                                    </span>
                                                </button>
                                            </div>
                                            {errors["name"] && (
                                                <p className="text-red-500 text-sm pt-3">
                                                    {
                                                        errors["name"]
                                                            .message as string
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Filter results */}
                                        <div className="flex flex-col w-full mt-4 max-h-64 overflow-y-auto">
                                            {tags.length !== 0 &&
                                                tags.map((tag) => (
                                                    <div
                                                        key={tag.id}
                                                        className={
                                                            "py-3 hover:cursor-pointer"
                                                        }
                                                    >
                                                        {tag.name}
                                                    </div>
                                                ))}
                                        </div>
                                    </form>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
