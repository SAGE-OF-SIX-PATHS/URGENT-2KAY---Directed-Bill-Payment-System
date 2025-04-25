import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  provider!: string ;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  amount!: number;
}