import StopWatch from "../stopwatch/StopWatch.tsx";

export default function Footer() {

    return (
        <footer className={"flex w-full px-12 py-6 bg-background border-t-2 justify-between"}>
            <StopWatch />
        </footer>
    )
}