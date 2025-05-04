import { Module } from '@nestjs/common';
import { BillController } from '../controllers/bill.controller';
import { BillService } from '../service/billService';
import { AppController } from '../controllers/app.controller';

@Module({
  imports: [],
  controllers: [BillController, AppController],
  providers: [BillService],
})
export class BillModule {}
export class AppModule {}