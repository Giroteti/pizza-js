export const customersDataTable: CustomerDataObject[] = [
    {
        id: 1,
        name: "Leonardo",
        iban: "FR7630004000031234567890143"
    }
]

export interface CustomerDataObject {
    id: number
    name: string
    iban: string
}
