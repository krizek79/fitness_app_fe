import StopWatch from "../stopwatch/StopWatch.tsx";
import {useContext} from "react";
import {AuthContext} from "../security/AuthContext.ts";

export default function Footer() {

    const {authData} = useContext(AuthContext)

    return (
        <footer className={"flex w-full px-12 py-6 bg-background border-t-2 justify-between shadow-sm"}>
            {authData.token ? <StopWatch /> : null}
        </footer>
    )
}