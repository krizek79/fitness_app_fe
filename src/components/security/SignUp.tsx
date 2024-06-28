import React, {Fragment, useState} from "react"
import {Dialog, DialogPanel, Transition, TransitionChild} from "@headlessui/react"
import FloatingLabelInput from "../util/FloatingLabelInput.tsx"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {signUpRequest, SignUpRequest} from "../../schema/SignUpRequest.ts"
import useSignUp from "../../hook/useSignUp.ts"

export default function SignUp() {

    const {signUp} = useSignUp()
    const [open, setOpen] = useState(false)
    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        },
        reset
    } = useForm<SignUpRequest>({
        resolver: zodResolver(signUpRequest)
    })

    function toggleOpen() {
        setOpen(!open)
    }

    function onSubmit(data: SignUpRequest) {
        signUp(data, toggleOpen)
        reset()
    }

    return (
        <>
            <button
                onClick={toggleOpen}
                className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                    "transition ease-in-out bg-gradient-to-r from-text to-secondary hover:bg-gradient-to-br " +
                    "duration-150"}
            >
                <span className={"text-background"}>Create new account</span>
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
                        <div className={"fixed inset-0 bg-black bg-opacity-75 transition-opacity"} />
                    </TransitionChild>

                    <div className={"fixed inset-0 overflow-y-auto px-3"}>
                        <div className={"flex min-h-full items-center justify-center"}>
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
                                    className={"transform overflow-hidden transition-all w-full px-6 py-12 " +
                                        "bg-background shadow-sm md:max-w-xl flex flex-col gap-y-6"}
                                >
                                    <form
                                        onSubmit={handleSubmit(onSubmit)}
                                        className={"w-full flex flex-col gap-y-12"}
                                    >
                                        <div className={"flex flex-col gap-y-6"}>
                                            <FloatingLabelInput
                                                register={register}
                                                id={"email"}
                                                name={"email"}
                                                type={"email"}
                                                label={"Email address"}
                                                errors={errors}
                                            />
                                            <FloatingLabelInput
                                                register={register}
                                                id={"password"}
                                                name={"password"}
                                                type={"password"}
                                                label={"Password"}
                                                errors={errors}
                                            />
                                            <FloatingLabelInput
                                                register={register}
                                                id={"matchingPassword"}
                                                name={"matchingPassword"}
                                                type={"password"}
                                                label={"Repeat password"}
                                                errors={errors}
                                            />
                                        </div>

                                        <button
                                            type={"submit"}
                                            disabled={isSubmitting}
                                            className={"flex w-full justify-center gap-x-3 items-center border px-6 " +
                                                "py-1.5 rounded transition ease-in-out bg-gradient-to-r from-text " +
                                                "to-secondary hover:bg-gradient-to-br duration-150 " +
                                                "disabled:opacity-50 disabled:cursor-not-allowed"}
                                        >
                                            <span className={"text-background"}>Create new account</span>
                                        </button>
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