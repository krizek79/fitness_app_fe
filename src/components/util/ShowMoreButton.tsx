import React from "react"

interface ShowMoreButtonProps {
    handleShowMore: () => void
}

export default function ShowMoreButton(props: ShowMoreButtonProps) {
    return (
        <button
            className="text-text hover:underline w-full flex justify-center mt-3"
            onClick={props.handleShowMore}
        >
            <span className="text-text hover:underline">Show more</span>
        </button>
    )
}
