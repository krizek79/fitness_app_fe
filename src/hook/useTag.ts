import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../components/security/AuthContext"
import { TagResponse } from "../schema/TagResponse"
import { TagFilterRequest } from "../schema/TagFilterRequest"
import tagApi from "../api/TagApi"
import axios, { AxiosError, AxiosResponse } from "axios"
import { PageResponse } from "../schema/PageResponse"
import { toast } from "sonner"
import { TagCreateRequest } from "../schema/TagCreateRequest"

export const useFilterTags = (name: string) => {
    const { logout } = useContext(AuthContext)
    const [filterTagsLoading, setFilterTagsLoading] = useState(false)
    const [tags, setTags] = useState<TagResponse[]>([])
    const DEFAULT_PAGE_SIZE = 5

    useEffect(() => {
        if (name === undefined || name === "") {
            setTags([])
            return
        }

        const delayDebounceFn = setTimeout(() => {
            setFilterTagsLoading(true)

            const request: TagFilterRequest = {
                page: 0,
                size: DEFAULT_PAGE_SIZE,
                sortBy: "id",
                sortDirection: "DESC",
                name: name,
            }

            tagApi
                .filterTags(request)
                .then((response: AxiosResponse<PageResponse<TagResponse>>) => {
                    setTags(response.data.results)
                })
                .catch((error: AxiosError) => {
                    if (error.status === 401) {
                        logout()
                    }
                    console.log(error)
                    toast.error("Oops... Something went wrong.")
                })
                .finally(() => setFilterTagsLoading(false))
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [logout, name])

    return { tags, filterTagsLoading }
}

export const useCreateTag = () => {
    const { logout } = useContext(AuthContext)
    const [createTagLoading, setCreateTagLoading] = useState(false)

    const createTag = async (
        request: TagCreateRequest
    ): Promise<TagResponse | null> => {
        setCreateTagLoading(true)
        try {
            const response = await tagApi.createTag(request)
            if (response.status === 200) {
                const newTag: TagResponse = response.data
                toast.success(`Tag { ${newTag.name} } has been created.`)
                return newTag
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 401) {
                    logout()
                }
                console.log(error)
                toast.error("Oops... Something went wrong.")
            } else {
                console.error("An unexpected error occurred:", error)
            }
        } finally {
            setCreateTagLoading(false)
        }
        return null
    }

    return { createTagLoading, createTag }
}
