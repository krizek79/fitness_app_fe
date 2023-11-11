import {Paths} from "../../constants/Paths.ts";
import MainMenu from "./MainMenu.tsx";
import {useContext} from "react";
import {AuthContext} from "../security/AuthContext.ts";

export default function Header() {

    const {authData} = useContext(AuthContext)

    return (
        <header className={"flex w-full px-6 md:px-12 py-6 justify-between border-b-2 bg-background items-start shadow-sm"}>
            {authData.token ? <MainMenu /> : null}
            {/*<MainMenu />*/}
            <a
                href={Paths.HOME}
                className={"text-3xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-secondary " +
                    "to-primary drop-shadow-md"}
            >
                shapeUp
            </a>
        </header>
    )
}