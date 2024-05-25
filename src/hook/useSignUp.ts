import {SignUpRequest} from "../schema/SignUpRequest.ts"
import authApi from "../api/AuthApi.ts"
import { toast } from 'sonner'

export default function useSignUp() {

    const signUp = (request: SignUpRequest, toggleOpen: () => void) => {
        authApi.signUp(request)
            .then(response => {
                if (response.status === 200) {
                    toggleOpen()
                    toast.success("Sign in successful", { duration: 4000 })
                }
            })
            .catch(error => {
                if (error.response?.data?.message) {
                    console.log(error)
                    toast.error(error.response?.data?.message)
                }
            })
    }

    return {signUp}
}