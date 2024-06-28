import { useContext } from "react"
import { AuthContext } from "../components/security/AuthContext.ts"
import { useNavigate } from "react-router-dom"
import { Paths } from "../constants/Paths.ts"
import { LocalAuthenticationRequest } from "../schema/LocalAuthenticationRequest.ts"
import authApi from "../api/AuthApi.ts"
import { toast } from "sonner"
import { AuthenticationResponse } from "../schema/AuthenticationResponse.ts"
import { AxiosError, AxiosResponse } from "axios"

export default function useSignIn() {
    
    const context = useContext(AuthContext)
    const navigate = useNavigate()

    const signIn = (request: LocalAuthenticationRequest) => {
        authApi
            .signIn(request)
            .then((response: AxiosResponse<AuthenticationResponse>) => {
                if (response.status === 200) {
                    context.login(response.data)
                    navigate(Paths.HOME)
                }
            })
            .catch((error: AxiosError) => {
                console.log(error)
                toast.error(
                    "Sign-in failed. Please check your credentials and try again."
                )
            })
    }

    return { signIn }
}
