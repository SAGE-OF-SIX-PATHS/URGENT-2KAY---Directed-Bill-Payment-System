// src/modules/provider.module.ts
import { Module } from '@nestjs/common';
import { ProviderController } from '../controllers/provider.controller';
import { ProvidersService } from '../service/provider.service';
import { PrismaService } from '../service/prisma.service'; // Make sure Prisma service is imported

@Module({
  imports: [],
  controllers: [ProviderController],
  providers: [ProvidersService, PrismaService], // Ensure ProvidersService is added to the providers
  exports: [ProvidersService], // Export ProvidersService if needed in other modules
})
export class ProviderModule {}
