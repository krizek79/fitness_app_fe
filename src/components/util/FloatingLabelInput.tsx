import { ReactElement, ReactNode, ReactPortal } from "react";

type FloatingLabelInputParams = {
    id: string | undefined;
    name: string | undefined;
    type: string | undefined;
    label: string | number | boolean | ReactElement | Iterable<ReactNode> | ReactPortal | null | undefined;
};
export default function FloatingLabelInput(props: FloatingLabelInputParams) {

    return (
        <div className="relative">
            <input
                id={props.id}
                name={props.name}
                type={props.type}
                className={"peer h-12 w-full border-b-2 placeholder-transparent focus:outline-none " +
                    "focus:border-primary bg-background text-text"}
                placeholder=""
            />
            <label htmlFor={props.id}
                   className={"absolute left-0 -top-3 text-sm transition-all text-secondary " +
                       "peer-placeholder-shown:text-base peer-placeholder-shown:text-secondary " +
                       "peer-placeholder-shown:top-2 peer-focus:-top-3 peer-focus:text-secondary peer-focus:text-sm"}
            >
                {props.label}
            </label>
        </div>
    )
}