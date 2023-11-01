import useStopWatch from "./useStopWatch.ts";
import {PlayIcon} from "../icon/PlayIcon.tsx";
import {PauseIcon} from "../icon/PauseIcon.tsx";
import {StopIcon} from "../icon/StopIcon.tsx";

export default function StopWatch() {

    const { isRunning, time, handleStartStop, handleReset, formatTime } = useStopWatch()

    return (
        <div className={"flex w-full justify-center gap-x-12"}>
            <div className={"flex gap-x-6 items-center"}>
                <button
                    onClick={handleStartStop}
                    className={"p-2 border-2 border-primary rounded-full hover:bg-accent transition duration-150"}
                >
                    {!isRunning
                        ? <PlayIcon className={"text-text h-5"}/>
                        : <PauseIcon className={"text-text h-5"}/>
                    }
                </button>
                <span className={"text-text text-2xl font-normal"}>
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