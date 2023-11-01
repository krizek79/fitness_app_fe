import FloatingLabelInput from "../util/FloatingLabelInput.tsx"

export default function Authentication() {

    function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault()
    }

    return (
        <div className={"flex w-full justify-center px-1.5 md:px-6"}>
            <form onSubmit={handleSubmit}
                  className={"w-full md:w-1/2 flex flex-col gap-y-6 justify-center border-2 p-6 shadow-sm"}
            >
                {/*Fields*/}
                <div className={"w-full flex flex-col gap-y-6"}>
                    <FloatingLabelInput id={"email"} name={"email"} type={"email"} label={"Email address"} />
                    <FloatingLabelInput id={"password"} name={"password"} type={"password"} label={"Password"} />
                </div>
                {/*Buttons*/}
                <div className={"w-full flex flex-col gap-y-3"}>
                    {/*Sign in*/}
                    <button
                        type={"submit"}
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                            "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                            "duration-150"}
                    >
                        <span className={"text-text"}>Sign in</span>
                    </button>

                    {/*Border*/}
                    <div className={"w-full flex items-center justify-between gap-x-3"}>
                        <div className={"w-full border-b-2"} />
                        <span className={"text-secondary font-bold"}>or</span>
                        <div className={"w-full border-b"} />
                    </div>

                    {/*Sign up*/}
                    <button
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                            "transition ease-in-out bg-gradient-to-r from-text to-secondary hover:bg-gradient-to-br " +
                            "duration-150"}
                    >
                        <span className={"text-background"}>Create new account</span>
                    </button>

                    {/*Socials*/}
                    <button
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                            "transition ease-in-out bg-facebook duration-150 disabled:opacity-50 cursor-not-allowed"}
                        disabled={true}
                    >
                        <span className={"text-background"}>Continue with Facebook</span>
                    </button>
                </div>
            </form>
        </div>
    )
}