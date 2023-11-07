import { AuthContext } from "./AuthContext.js"
import React, {useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import {UserResponse} from "../../schema/UserResponse.ts"
import {LoginParams} from "./LoginParams.ts"
import {Paths} from "../../constants/Paths.ts"
import {CookieParams} from "../../constants/CookieParams.ts"

interface AuthProviderProps {
    children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {

    const navigate = useNavigate()
    const [authData, setAuthData] = useState<{
        token: string | null
        expiresAt: string | null
    }>({
        token: null,
        expiresAt: null,
    })

    useEffect(() => {
        const token = Cookies.get(CookieParams.TOKEN)
        const expiresAt = Cookies.get(CookieParams.EXPIRES_AT)
        const user = Cookies.get(CookieParams.USER)

        if (!token || !expiresAt || !user) {
            logout()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = (loginParams: LoginParams) => {
        Cookies.set(CookieParams.TOKEN, loginParams.token)
        Cookies.set(CookieParams.EXPIRES_AT, loginParams.expiresAt)
        Cookies.set(CookieParams.USER, JSON.stringify(loginParams.user))
    }

    const logout = () => {
        setAuthData({ token: null, expiresAt: null })
        Cookies.remove(CookieParams.TOKEN)
        Cookies.remove(CookieParams.EXPIRES_AT)
        Cookies.remove(CookieParams.USER)
        navigate(Paths.AUTH)
    }

    const getUser = (): UserResponse | null => {
        const userString = Cookies.get(CookieParams.USER)
        if (userString) {
            return JSON.parse(userString) as UserResponse
        }
        return null
    }

    return (
        <AuthContext.Provider value={{ authData, login, logout, getUser }}>
            {children}
        </AuthContext.Provider>
    )
}