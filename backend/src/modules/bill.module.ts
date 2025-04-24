import { Module } from '@nestjs/common';
import { BillController } from '../controllers/bill.controlles';
import { BillService } from '../service/billService';
// import { BillService } from './bill.service';
// import { BillController } from './bill.controller';
import { PrismaModule } from '../prisma/schema.prisma';

@Module({
    imports: [PrismaModule],
    providers: [BillService],
    controllers: [BillController],
  })
  export class BillModule {}