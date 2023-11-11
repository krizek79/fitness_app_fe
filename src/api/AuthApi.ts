import {SignUpRequest} from "../schema/SignUpRequest.ts"
import axios from "axios"
import {LocalAuthenticationRequest} from "../schema/LocalAuthenticationRequest.ts";

const AUTH_API_BASE_URL = "http://localhost:8080/auth"

export default new class AuthApi {

    signInLocal(request: LocalAuthenticationRequest) {
        return axios.post(AUTH_API_BASE_URL + "/sign-in/local", request)
    }

    signUp(request: SignUpRequest) {
        return axios.post(AUTH_API_BASE_URL + "/sign-up", request)
    }
}