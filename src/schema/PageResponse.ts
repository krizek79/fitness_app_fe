export type PageResponse<T> = {
    pageNumber: number
    pageSize: number
    totalPages: number
    totalElements: number
    results: T[]
}