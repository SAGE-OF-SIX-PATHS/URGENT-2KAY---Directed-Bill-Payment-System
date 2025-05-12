import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name!: string; // Name of the provider (e.g., "MTN", "Ikeja Electric")

  @IsString()
  @IsNotEmpty()
  type!: string; // Type of provider (e.g., "AIRTIME", "ELECTRICITY")
}