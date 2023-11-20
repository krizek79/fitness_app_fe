export default function GoogleButton() {

    return (
        <button
            className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 " +
                "transition ease-in-out bg-red-700 duration-150 disabled:opacity-50 cursor-not-allowed"}
            disabled={true}
        >
            <span className={"text-background"}>Continue with Google</span>
        </button>
    )
}