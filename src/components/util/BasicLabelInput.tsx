import {
    DeepRequired,
    FieldErrorsImpl,
    FieldValues,
    GlobalError,
    Path,
    UseFormRegister,
} from "react-hook-form"

type BasicLabelInputParams<T extends FieldValues> = {
    id: string
    name: Path<T>
    type: string
    label: string
    value?: string | null
    register: UseFormRegister<T>
    errors: Partial<FieldErrorsImpl<DeepRequired<T>>> & {
        root?: Record<string, GlobalError> & GlobalError
    }
}

export default function BasicLabelInput<T extends FieldValues>(
    props: BasicLabelInputParams<T>
) {
    const error = props.errors[props.name]

    return (
        <div className="relative">
            <label htmlFor={props.id} className={"text-base text-secondary"}>
                {props.label}
            </label>
            <input
                {...props.register(props.name)}
                id={props.id}
                name={props.name}
                type={props.type}
                defaultValue={props.value ?? ""}
                className={
                    "w-full py-1.5 border-b-2 placeholder-transparent focus:outline-none " +
                    "focus:border-primary bg-background text-gray-500 focus:text-text"
                }
                placeholder={""}
            />
            {error && (
                <p className="text-red-500 text-sm pt-3">
                    {error.message as string}
                </p>
            )}
        </div>
    )
}
