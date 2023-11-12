import { createContext } from 'react'
import {UserResponse} from "../../schema/UserResponse.ts"
import {LoginParams} from "./LoginParams.ts";

interface AuthContextProps {
    authData: {
        token: string | null
        expiresAt: string | null
    };
    login: (loginParams: LoginParams) => void
    logout: () => void
    getUser: () => UserResponse | null
}

export const AuthContext = createContext<AuthContextProps>({
    authData: {
        token: "",
        expiresAt: ""
    },
    login: () => {},
    logout: () => {},
    getUser: () => null
})
