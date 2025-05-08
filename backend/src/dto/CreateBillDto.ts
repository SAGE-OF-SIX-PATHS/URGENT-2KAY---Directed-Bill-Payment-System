import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsObject,
} from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  providerId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  amount!: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>; // dynamic fields like phoneNumber, meterNumber, etc.
} 
