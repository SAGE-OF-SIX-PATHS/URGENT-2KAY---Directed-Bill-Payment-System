export class UpdateBillDto {
  readonly id?: string;
  readonly customerName?: string;
  readonly amount?: number;
  readonly dueDate?: Date;
  readonly paymentStatus?: string;
}