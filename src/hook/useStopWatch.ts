import {useEffect, useState} from "react";

export default function useStopWatch() {

    const [isRunning, setIsRunning] = useState<boolean>(false)
    const [time, setTime] = useState<number>(0)

    useEffect(() => {
        let interval: number | undefined = undefined
        if (isRunning) {
            interval = window.setInterval(() => {
                setTime((prevTime) => prevTime + 1)
            }, 10)
        }

        return () => {
            if (interval !== undefined) {
                clearInterval(interval);
            }
        }
    }, [isRunning])

    const handleStartStop = () => {
        setIsRunning((prevState) => !prevState)
    }

    const handleReset = () => {
        setTime(0)
        setIsRunning(false)
    }

    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / (60 * 100))
        const seconds = Math.floor((time / 100) % 60)
        const milliseconds = time % 100;
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    }

    return { isRunning, time, handleStartStop, handleReset, formatTime }
}