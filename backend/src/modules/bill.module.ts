import { Module } from '@nestjs/common';
import { BillController } from '../controllers/bill.controller';
import { BillService } from '../service/billService';

@Module({
  controllers: [BillController],
  providers: [BillService],
  exports: [BillService], // Export if needed in other modules
})
export class BillModule {}

