import {SignUpRequest} from "../schema/SignUpRequest.ts"
import authApi from "../api/AuthApi.ts"

export default function useSignUp() {

    const signUp = (request: SignUpRequest, toggleOpen: () => void) => {
        authApi.signUp(request)
            .then(response => {
                if (response.status === 200) {
                    toggleOpen()
                }
            })
            .catch(error => {
                if (error.response?.data?.message) {
                    console.log(error)
                }
            })
    }

    return {signUp}
}