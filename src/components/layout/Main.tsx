import {Route, Routes} from "react-router-dom";
import {Paths} from "../../constants/Paths.ts";
import Authentication from "../page/Authentication.tsx";
import Home from "../page/Home.tsx";

export default function Main() {

    return (
        <main className={"flex-grow overflow-y-auto bg-background py-6"}>
            <Routes>
                <Route index path={Paths.HOME} element={<Home />} />
                <Route path={Paths.AUTH} element={<Authentication />} />
            </Routes>
        </main>
    )
}