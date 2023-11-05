import FloatingLabelInput from "../util/FloatingLabelInput.tsx"
import SignUp from "./SignUp.tsx"
import useSignIn from "../security/useSignIn.ts"
import {SignInRequest} from "../../api/request/SignInRequest.ts"

export default function Authentication() {

    const { signIn } = useSignIn()

    const signInRequest: SignInRequest = {
        email: "",
        password: ""
    }

    function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault()
        signIn(signInRequest)
    }

    return (
        <div className={"flex w-full justify-center px-0 md:px-6"}>
            <div className={"flex flex-col shadow-sm border-2 px-6 py-12 gap-y-6 justify-center w-full md:w-1/2"}>
                <form onSubmit={handleSubmit} className={"w-full flex flex-col gap-y-12"}>
                    {/*Fields*/}
                    <div className={"w-full flex flex-col gap-y-6"}>
                        <FloatingLabelInput
                            id={"signInEmail"}
                            name={"signInEmail"}
                            type={"email"}
                            label={"Email address"}
                        />
                        <FloatingLabelInput
                            id={"signInPassword"}
                            name={"signInPassword"}
                            type={"password"}
                            label={"Password"}
                        />
                    </div>

                    {/*Sign in*/}
                    <button
                        type={"submit"}
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                            "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                            "duration-150"}
                    >
                        <span className={"text-text"}>Sign in</span>
                    </button>
                </form>

                {/*Border*/}
                <div className={"w-full flex items-center justify-between gap-x-3"}>
                    <div className={"w-full border-b-2"} />
                    <span className={"text-secondary font-bold"}>or</span>
                    <div className={"w-full border-b"} />
                </div>

                {/*Buttons*/}
                <div className={"flex flex-col gap-y-3"}>
                    <SignUp />

                    {/*Socials*/}
                    <button
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                            "transition ease-in-out bg-facebook duration-150 disabled:opacity-50 cursor-not-allowed"}
                        disabled={true}
                    >
                        <span className={"text-background"}>Continue with Facebook</span>
                    </button>
                </div>
            </div>
        </div>
    )
}