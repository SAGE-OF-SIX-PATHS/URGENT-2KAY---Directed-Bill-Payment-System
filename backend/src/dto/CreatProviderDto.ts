import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  contactInfo!: string; // Add this property
}