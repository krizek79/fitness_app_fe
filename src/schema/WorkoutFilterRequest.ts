export type WorkoutFilterRequest = {
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    name: string | null,
    levelKey: string | null,
    tagNameList: []
}