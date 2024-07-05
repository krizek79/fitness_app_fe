import { TagFilterRequest } from "./../schema/TagFilterRequest"
import axios from "axios"
import Cookies from "js-cookie"
import { PageResponse } from "../schema/PageResponse.ts"
import { TagResponse } from "../schema/TagResponse.ts"
import { TagCreateRequest } from "../schema/TagCreateRequest.ts"

const TAG_API_BASE_URL = "http://localhost:8080/tags"

export default new (class TagApi {
    filterTags(request: TagFilterRequest) {
        return axios.post<PageResponse<TagResponse>>(
            `${TAG_API_BASE_URL}/filter`,
            request,
            {
                headers: {
                    Authorization: "Bearer " + Cookies.get("token"),
                },
            }
        )
    }

    createTag(request: TagCreateRequest) {
        return axios.post<TagResponse>(TAG_API_BASE_URL, request, {
            headers: {
                Authorization: "Bearer " + Cookies.get("token"),
            },
        })
    }
})()
