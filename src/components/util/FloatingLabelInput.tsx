import {DeepRequired, FieldErrorsImpl, FieldValues, GlobalError, Path, UseFormRegister} from "react-hook-form"

type FloatingLabelInputParams<T extends FieldValues> = {
    id: string
    name: Path<T>
    type: string
    label: string
    register: UseFormRegister<T>
    errors: Partial<FieldErrorsImpl<DeepRequired<T>>> & {root?: Record<string, GlobalError> & GlobalError}
}

export default function FloatingLabelInput<T extends FieldValues>(props: FloatingLabelInputParams<T>) {

    const error = props.errors[props.name]

    return (
        <div className="relative">
            <input
                {...props.register(props.name)}
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
            {error && <p className="text-red-500 text-sm pt-3">{error.message as string}</p>}
        </div>
    )
}