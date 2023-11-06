import FloatingLabelInput from "../util/FloatingLabelInput.tsx"
import SignUp from "./SignUp.tsx"
import useSignIn from "../security/useSignIn.ts"
import {FieldValues, useForm} from "react-hook-form"

export default function Authentication() {

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting
        },
        reset
    } = useForm()
    const { signIn } = useSignIn()

    function onSubmit(data: FieldValues) {
        console.log(data)
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
                            name={"signInEmail"}
                            type={"email"}
                            label={"Email address"}
                            required={"Email is mandatory."}
                            errors={errors}
                        />
                        <FloatingLabelInput
                            register={register}
                            id={"signInPassword"}
                            name={"signInPassword"}
                            type={"password"}
                            label={"Password"}
                            required={"Password is mandatory."}
                            errors={errors}
                        />
                    </div>

                    {/*Sign in*/}
                    <button
                        type={"submit"}
                        disabled={isSubmitting}
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