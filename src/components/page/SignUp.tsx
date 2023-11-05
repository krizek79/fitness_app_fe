import React, {Fragment, useState} from "react";
import {Dialog, Transition} from "@headlessui/react";
import FloatingLabelInput from "../util/FloatingLabelInput.tsx";

export default function SignUp() {

    const [open, setOpen] = useState(false)

    function toggleOpen() {
        setOpen(!open)
    }

    function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault()
    }

    return (
        <>
            <button
                onClick={toggleOpen}
                className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                    "transition ease-in-out bg-gradient-to-r from-text to-secondary hover:bg-gradient-to-br " +
                    "duration-150"}
            >
                <span className={"text-background"}>Create new account</span>
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

                    <div className={"fixed inset-0 overflow-y-auto px-3"}>
                        <div className={"flex min-h-full items-center justify-center"}>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-500"
                                enterFrom="opacity-0 scale-50"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-500"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-50"
                            >
                                <Dialog.Panel
                                    className={"transform overflow-hidden transition-all w-full px-6 py-12 " +
                                        "bg-background shadow-sm md:max-w-xl flex flex-col gap-y-6"}
                                >
                                    <form
                                        onSubmit={handleSubmit}
                                        className={"w-full flex flex-col gap-y-12"}
                                    >
                                        <div className={"flex flex-col gap-y-6"}>
                                            <FloatingLabelInput
                                                id={"signUpEmail"}
                                                name={"signUpEmail"}
                                                type={"email"}
                                                label={"Email address"}
                                            />
                                            <FloatingLabelInput
                                                id={"signUpName"}
                                                name={"signUpName"}
                                                type={"text"}
                                                label={"Name"}
                                            />
                                            <FloatingLabelInput
                                                id={"signUpPassword"}
                                                name={"signUpPassword"}
                                                type={"password"}
                                                label={"Password"}
                                            />
                                            <FloatingLabelInput
                                                id={"signUpMatchingPassword"}
                                                name={"signUpMatchingPassword"}
                                                type={"password"}
                                                label={"Repeat password"}
                                            />
                                        </div>

                                        <button
                                            type={"submit"}
                                            className={"flex w-full justify-center gap-x-3 items-center border px-6 " +
                                                "py-1.5 rounded transition ease-in-out bg-gradient-to-r from-text " +
                                                "to-secondary hover:bg-gradient-to-br duration-150"}
                                        >
                                            <span className={"text-background"}>Create new account</span>
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}