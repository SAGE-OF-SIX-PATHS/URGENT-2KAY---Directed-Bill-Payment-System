import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  provider!: string ;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsNumber()
  amount!: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;
}