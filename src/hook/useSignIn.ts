import {useContext} from "react"
import {AuthContext} from "../components/security/AuthContext.ts"
import {useNavigate} from "react-router-dom"
import {Paths} from "../constants/Paths.ts"
import {LocalAuthenticationRequest} from "../schema/LocalAuthenticationRequest.ts"

export default function useSignIn() {

    const context = useContext(AuthContext)
    const navigate = useNavigate()

    const signIn = (request: LocalAuthenticationRequest) => {
        console.log(request)
        //  TODO: make http request to signIn endpoint, get response and call context.login function from AuthContext
        navigate(Paths.HOME)
    }

    return {signIn}
}