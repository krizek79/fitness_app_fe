import {SignUpRequest} from "../schema/SignUpRequest.ts"
import authApi from "../api/AuthApi.ts"
import { toast } from 'sonner'
import { AxiosResponse } from "axios"

export default function useSignUp() {

    const signUp = (request: SignUpRequest, toggleOpen: () => void) => {
        authApi.signUp(request)
            .then((response: AxiosResponse<string>) => {
                if (response.status === 200) {
                    toggleOpen()
                    toast.success(response.data, { duration: 4000 })
                }
            })
            .catch((error: { response: { data: { message: string } } }) => {
                if (error.response?.data?.message) {
                    console.log(error)
                    toast.error(error.response?.data?.message)
                }
            })
    }

    return {signUp}
}