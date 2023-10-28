import useStopWatch from "./useStopWatch.ts";
import {PlayIcon} from "../icons/PlayIcon.tsx";
import {PauseIcon} from "../icons/PauseIcon.tsx";
import {StopIcon} from "../icons/StopIcon.tsx";

export default function StopWatch() {

    const { isRunning, time, handleStartStop, handleReset, formatTime } = useStopWatch()

    return (
        <div className={"flex w-full justify-center gap-x-12 items-center"}>
            <div className={"flex gap-x-6"}>
                <button
                    onClick={handleStartStop}
                    className={"p-2 border-2 border-primary rounded-full hover:bg-accent transition duration-150"}
                >
                    {!isRunning
                        ? <PlayIcon className={"text-text h-5"}/>
                        : <PauseIcon className={"text-text h-5"}/>
                    }
                </button>
                <span className={"text-text text-2xl font-normal text-left"}>
                    {formatTime(time)}
                </span>
                <button
                    onClick={handleReset}
                    className={"p-2 border-2 border-primary rounded-full hover:bg-accent transition duration-150"}
                >
                    <StopIcon className={"text-text h-5"}/>
                </button>
            </div>
        </div>
    )
}