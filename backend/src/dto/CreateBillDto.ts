import { IsString, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  providerId!: string;

  metadata?: Record<string, any>; // dynamic fields like phoneNumber, meterNumber, etc.
}

function IsOptional(): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol): void {
    // Add metadata to mark the property as optional
    Reflect.defineMetadata('isOptional', true, target, propertyKey);
  };
}
