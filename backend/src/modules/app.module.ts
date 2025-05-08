import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module'; // Import PrismaModule
import { BillController } from '../controllers/bill.controller';
import { AppController } from '../controllers/app.controller';
import { ProviderController } from '../controllers/provider.controller';
import { BillModule } from './bill.module';
import { ProviderModule } from './provider.module';

@Module({
  imports: [PrismaModule, BillModule, ProviderModule], // Add PrismaModule here
  controllers: [AppController, BillController, ProviderController],
  providers: [],
})
export class AppModule {}
