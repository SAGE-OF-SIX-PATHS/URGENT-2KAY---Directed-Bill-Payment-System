import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { PrismaService } from './prisma.service';

@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBillDto): Promise<any> {
    const provider = await this.prisma.provider.findUnique({
      where: { id: dto.providerId },
    });
    if (!provider) throw new NotFoundException('Provider not found');

    return this.prisma.bill.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate,
        userId,
        providerId: dto.providerId,
        metadata: {
          create: Object.entries(dto.metadata || {}).map(([key, value]) => ({
            key,
            value: String(value),
          })),
        },
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

  getBills() {
    return { message: 'List of bills' };
  }
}