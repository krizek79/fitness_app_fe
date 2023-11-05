import {useContext} from "react"
import {AuthContext} from "./AuthContext.ts"
import {useNavigate} from "react-router-dom"
import {Paths} from "../../constants/Paths.ts"
import {SignInRequest} from "../../api/request/SignInRequest.ts"

export default function useSignIn() {

    // const { login } = useContext(AuthContext)
    const navigate = useNavigate()

    const signIn = (request: SignInRequest) => {
        console.log("sign in")

        //  TODO: make http request to signIn endpoint, get response and call login function from AuthContext

        navigate(Paths.HOME)
    }

    return { signIn }
}