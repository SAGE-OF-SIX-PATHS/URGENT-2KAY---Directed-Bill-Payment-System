import { Module } from '@nestjs/common';
import { BillController } from '../controllers/bill.controller';
import { BillService } from '../service/billService';

@Module({
  imports: [],
  controllers: [BillController],
  providers: [BillService],
})
export class BillModule {}
export class AppModule {}