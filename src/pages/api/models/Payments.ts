export default interface Payments {
    id: string
    amountInPennies?: number
    method: string
    homeownerId: number
    createdAt: string
    isActive?: boolean
}
