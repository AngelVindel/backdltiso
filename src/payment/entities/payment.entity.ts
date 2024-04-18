
export class Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    customerId: string;
    // otras propiedades relacionadas con el pago
  
    constructor(id: number, amount: number, currency: string, status: string, customerId: string) {
      this.id = id;
      this.amount = amount;
      this.currency = currency;
      this.status = status;
      this.customerId = customerId;
    }
  }