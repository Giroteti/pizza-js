export interface PaymentClientDataObject {
    customerIban: string
    pizzeriaIban: string
    amount: number
}

export class PaymentClient {
    pay(customerIban: string, pizzeriaIban: string, amount: number) {
        throw new Error("To be implemented");
    }
}
