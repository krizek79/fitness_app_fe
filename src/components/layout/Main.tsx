import {Route, Routes} from "react-router-dom"
import {Paths} from "../../constants/Paths.ts"
import Authentication from "../page/Authentication.tsx"
import Home from "../page/home/Home.tsx"
import PrivateRoutes from "../security/PrivateRoutes.tsx"
import WorkoutDetail from "../page/workout/WorkoutDetail.tsx"
import WorkoutDetailEdit from "../page/workout/WorkoutDetailEdit.tsx"
import Profile from "../page/Profile.tsx"
import { Toaster } from "sonner"

export default function Main() {

    return (
        <main className={"flex-grow overflow-y-auto bg-background py-6"}>
            <Toaster richColors closeButton position="top-right" />
            <Routes>
                <Route path={Paths.AUTH} element={<Authentication />} />
                <Route element={<PrivateRoutes />}>
                    <Route index path={Paths.HOME} element={<Home />} />
                    <Route index path={Paths.WORKOUT} element={<WorkoutDetail />} />
                    <Route index path={Paths.WORKOUT_EDIT} element={<WorkoutDetailEdit />} />
                    <Route index path={Paths.PROFILE} element={<Profile />} />
                </Route>
            </Routes>
        </main>
    )
}