import {useContext} from "react"
import {AuthContext} from "../components/security/AuthContext.ts"
import {useNavigate} from "react-router-dom"
import {Paths} from "../constants/Paths.ts"
import {LocalAuthenticationRequest} from "../schema/LocalAuthenticationRequest.ts"
import authApi from "../api/AuthApi.ts"
import { toast } from 'sonner'

export default function useSignIn() {

    const context = useContext(AuthContext)
    const navigate = useNavigate()

    const signIn = (request: LocalAuthenticationRequest) => {
        authApi.signInLocal(request)
            .then(response => {
                if (response.status === 200) {
                    context.login(response.data)
                    navigate(Paths.HOME)
                    toast.success("Sign in successful", { duration: 4000 })
                }
            })
            .catch(error => {
                if (error.response?.data?.message) {
                    console.log(error)
                }
                toast.error("Sign-in failed. Please check your credentials and try again.")
            })
    }

    return {signIn}
}