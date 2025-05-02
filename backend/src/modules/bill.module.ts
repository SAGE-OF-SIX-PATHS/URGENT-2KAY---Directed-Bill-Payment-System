import { Module } from '@nestjs/common';
import { BillController } from '../controllers/bill.controller';
import { BillService } from '../service/billService';//
// import { BillService } from './bill.service';
// import { BillController } from './bill.controller';

@Module({
    imports: [],
    providers: [BillService],
    controllers: [BillController],
  })
  export class BillModule {}