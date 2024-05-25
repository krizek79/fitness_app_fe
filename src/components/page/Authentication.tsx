import FloatingLabelInput from "../util/FloatingLabelInput.tsx"
import SignUp from "../security/SignUp.tsx"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {localAuthenticationRequest, LocalAuthenticationRequest} from "../../schema/LocalAuthenticationRequest.ts"
import useSignIn from "../../hook/useSignIn.ts";
import FacebookButton from "../util/FacebookButton.tsx";
import GoogleButton from "../util/GoogleButton.tsx";

export default function Authentication() {

    const {signIn} = useSignIn()
    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        },
        reset
    } = useForm<LocalAuthenticationRequest>({
        resolver: zodResolver(localAuthenticationRequest)
    })

    function onSubmit(data: LocalAuthenticationRequest) {
        signIn(data)
        reset()
    }

    return (
        <div className={"flex w-full justify-center px-0 md:px-6"}>
            <div
                className={"flex flex-col shadow-sm md:border-2 px-6 py-12 gap-y-6 justify-center w-full md:w-2/3 " +
                    "lg:w-1/2"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className={"w-full flex flex-col gap-y-12"}>
                    {/*Fields*/}
                    <div className={"w-full flex flex-col gap-y-6"}>
                        <FloatingLabelInput
                            register={register}
                            id={"signInEmail"}
                            name={"email"}
                            type={"email"}
                            label={"Email address"}
                            errors={errors}
                        />
                        <FloatingLabelInput
                            register={register}
                            id={"signInPassword"}
                            name={"password"}
                            type={"password"}
                            label={"Password"}
                            errors={errors}
                        />
                    </div>

                    {/*Sign in*/}
                    <button
                        type={"submit"}
                        disabled={isSubmitting}
                        className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                            "transition ease-in-out bg-gradient-to-r from-primary to-accent hover:bg-gradient-to-br " +
                            "duration-150 disabled:opacity-50 disabled:cursor-not-allowed"}
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
                </div>
            </div>
        </div>
    )
}
