import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; 

const APPROVED_PROVIDERS = ['NEPA', 'MTN', 'GLO', 'University of Lagos'];
 
@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBillDto): Promise<any> {
    if (!APPROVED_PROVIDERS.includes(dto.provider)) {
      throw new Error('Provider not approved');
    }

    const { customerName, provider, amount, dueDate } = dto;

    return this.prisma.bill.create({
      data: {
        customerName, provider, amount, dueDate,
         userId,
        
        status: 'PENDING',
      },
    });
  }

  async findAll(userId: string): Promise<any[]> {
    return this.prisma.bill.findMany({ where: { userId } });
  }

  async findOne(userId: string, id: string): Promise<any | null> {
    return this.prisma.bill.findFirst({ where: { id, userId } });
  }

  async update(userId: string, id: string, dto: UpdateBillDto): Promise<any> {
    const bill = await this.findOne(userId, id);
    if (!bill) throw new NotFoundException('Bill not found');

    return this.prisma.bill.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string): Promise<any> {
    const bill = await this.findOne(userId, id);
    if (!bill) throw new NotFoundException('Bill not found');

    return this.prisma.bill.delete({ where: { id } });
  }
}