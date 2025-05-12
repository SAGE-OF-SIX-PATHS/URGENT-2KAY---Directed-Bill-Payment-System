import { IsString, IsNumber, IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import 'reflect-metadata';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDate()
  @Type(() => Date) // Automatically transform string to Date
  @IsNotEmpty()
  dueDate!: Date;

  // @IsString()
  // @IsOptional() // Mark providerId as optional if it is not always required
  // providerId?: string;

  @IsOptional() // Explicitly mark metadata as optional
  metadata?: Record<string, any>; // Dynamic fields like phoneNumber, meterNumber, etc.

  @IsNotEmpty()
  providerId!: string;
}
