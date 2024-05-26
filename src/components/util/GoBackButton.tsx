import { useNavigate } from "react-router-dom";

export default function GoBackButton() {

    const navigate = useNavigate()

    function handleSubmit() {
        navigate(-1)
    }

    return (
        <div className="flex">
            <button className={"text-text hover:underline"} onClick={handleSubmit}>
                Go back
            </button>
        </div>
    )
}