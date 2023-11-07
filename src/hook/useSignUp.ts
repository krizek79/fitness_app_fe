import {useNavigate} from "react-router-dom";
import {SignUpRequest} from "../schema/SignUpRequest.ts";

export default function useSignUp() {

    const navigate = useNavigate()

    const signUp = (request: SignUpRequest) => {
        console.log(request)
    }

    return {signUp}
}