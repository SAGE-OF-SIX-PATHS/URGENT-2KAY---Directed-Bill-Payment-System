export interface CreateBillDto {
    billName: string
    type: string
    description: string;
    note?: string
    amount: number
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
    dueDate?: string
    providerId?: string
    requestId?: string 
    }
  