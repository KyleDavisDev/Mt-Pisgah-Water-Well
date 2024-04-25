export default interface UsageBill {
    id: string
    propertyId: number
    previousUsage: number
    currentUsage: number
    gallonsDifference?: number
    formulaUsed: string
    amountInPennies?: number
    createdAt: string
    isActive?: boolean
}
