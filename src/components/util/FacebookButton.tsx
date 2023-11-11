export default function FacebookButton() {

    return (
        <button
            className={"flex w-full justify-center gap-x-3 items-center border px-6 py-1.5 rounded " +
                "transition ease-in-out bg-[#39569C] duration-150 disabled:opacity-50 cursor-not-allowed"}
            disabled={true}
        >
            <span className={"text-background"}>Continue with Facebook</span>
        </button>
    )
}