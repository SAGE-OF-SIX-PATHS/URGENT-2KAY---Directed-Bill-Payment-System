// filepath: c:\Users\nwaka\Documents\URGENT-2KAY---Directed-Bill-Payment-System\backend\src\modules\prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}