import { ReactElement, ReactNode, ReactPortal } from "react"
import {DeepMap, FieldError, FieldValues, UseFormRegister} from "react-hook-form"

type FloatingLabelInputParams = {
    id: string
    name: string
    type: string
    label: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal | null | undefined
    required: string | undefined
    register: UseFormRegister<FieldValues>
    errors: DeepMap<FieldValues, FieldError>
    validate?: undefined
}

export default function FloatingLabelInput(props: FloatingLabelInputParams) {

    const error = props.errors[props.name]

    return (
        <div className="relative">
            <input
                {...props.register(props.name, {
                    required: props.required,
                    validate: props.validate
                })}
                id={props.id}
                name={props.name}
                type={props.type}
                className={"peer h-12 w-full border-b-2 placeholder-transparent focus:outline-none " +
                    "focus:border-primary bg-background text-text"}
                placeholder={""}
            />
            <label htmlFor={props.id}
                   className={"absolute left-0 -top-3 text-sm transition-all text-secondary " +
                       "peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary " +
                       "peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-secondary peer-focus:text-sm"}
            >
                {props.label}
            </label>
            {error && <p className="text-red-500 text-sm pt-3">{error.message}</p>}
        </div>
    )
}