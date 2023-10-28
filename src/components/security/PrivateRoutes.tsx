import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import { Navigate, Outlet } from "react-router-dom"
import {Paths} from "../../constants/Paths.ts"

export default function PrivateRoutes() {

    const authContext = useContext(AuthContext)

    return authContext.authData.token ? <Outlet /> : <Navigate to={Paths.AUTH} />
}
