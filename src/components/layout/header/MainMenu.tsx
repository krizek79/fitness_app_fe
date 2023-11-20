import { Bars3BottomLeftIcon } from "../../icon/Bars3BottomLeftIcon.tsx"
import React, {Fragment, useContext, useState} from "react"
import { Dialog, Transition } from "@headlessui/react"
import {UserCircleIcon} from "../../icon/UserCircleIcon.tsx"
import {AuthContext} from "../../security/AuthContext.ts"
import {Paths} from "../../../constants/Paths.ts";

export default function MainMenu() {

    const {logout} = useContext(AuthContext)
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
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
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
                                    enter="transform transition ease-in-out duration-300"
                                    enterFrom="-translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-300"
                                    leaveFrom="translate-x-0"
                                    leaveTo="-translate-x-full"
                                >
                                    <Dialog.Panel className={"pointer-events-auto relative w-full"}>
                                        <div
                                            className={"flex h-full flex-col overflow-y-auto " +
                                                "bg-background"}
                                        >
                                            <div
                                                className={"px-6 md:px-12 py-6 flex flex-col gap-y-3 w-full " +
                                                    "border-b-2"}
                                            >
                                                {/*{user?.profileResponse.profilePictureUrl*/}
                                                {/*    ? <img*/}
                                                {/*        src={user?.profileResponse.profilePictureUrl}*/}
                                                {/*        className={"h-16 w-16 p-0"}*/}
                                                {/*        alt={"Profile picture"}*/}
                                                {/*    />*/}
                                                {/*    : <UserCircleIcon className={"h-16 w-16 p-0"} />*/}
                                                {/*}*/}
                                                <UserCircleIcon className={"h-16 w-16 p-0"} />
                                                <div className={"flex flex-col"}>
                                                        <span className={"text-text text-xl font-medium break-all"}>
                                                            Fake user
                                                        </span>
                                                    <a className={"text-primary hover:cursor-pointer"}>
                                                        View profile
                                                    </a>
                                                </div>
                                            </div>
                                            <div className={"flex flex-col border-b-2"}>
                                                <a
                                                    href={Paths.HOME}
                                                    className={"flex gap-x-3 w-full px-6 md:px-12 py-6 text-text " +
                                                        "hover:cursor-pointer hover:bg-accent transition " +
                                                        "duration-150 font-medium text-xl"}
                                                >
                                                    Home
                                                </a>
                                            </div>
                                            <div className={""}>
                                                <button
                                                    onClick={logout}
                                                    className={"flex gap-x-3 w-full px-6 md:px-12 py-6 " +
                                                        "hover:cursor-pointer text-text font-medium"}
                                                >
                                                    Log out
                                                </button>
                                            </div>
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