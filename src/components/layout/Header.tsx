import {Paths} from "../../constants/Paths.ts";
import MainMenu from "./MainMenu.tsx";

export default function Header() {

    return (
        <header className={"flex w-full px-12 py-6 justify-between border-b-2 bg-background items-start"}>
            <MainMenu />
            <a
                href={Paths.HOME}
                className={"text-3xl font-bold text-primary drop-shadow-md"}
            >
                shapeUp
            </a>
        </header>
    )
}