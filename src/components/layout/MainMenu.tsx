import { Bars3BottomLeftIcon } from "../icons/Bars3BottomLeftIcon.tsx"
import React, { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"

export default function MainMenu() {

    const [open, setOpen] = useState(false)

    function toggleOpen() {
        setOpen(!open)
    }

    return (
        <>
            <button onClick={toggleOpen}>
                <Bars3BottomLeftIcon className={"text-text h-10"} />
            </button>

            <Transition show={open} as={Fragment}>
                <Dialog as="div" className={"relative z-10"} onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className={"fixed inset-0 bg-black bg-opacity-75 transition-opacity"} />
                    </Transition.Child>

                    <div className={"fixed inset-0 overflow-hidden"}>
                        <div className={"absolute inset-0 overflow-hidden"}>
                            <div className={"pointer-events-none fixed inset-y-0 left-0 flex w-2/3 md:w-2/5"}>
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                                    enterFrom="-translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                                    leaveFrom="translate-x-0"
                                    leaveTo="-translate-x-full"
                                >
                                    <Dialog.Panel className={"pointer-events-auto relative w-screen max-w-md"}>
                                        <div
                                            className={"flex h-full flex-col overflow-y-scroll bg-background px-6 py-6"}
                                        >

                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}