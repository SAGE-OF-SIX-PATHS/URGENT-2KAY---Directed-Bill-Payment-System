import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/schema.prisma';
import { CreateBillDto } from './create-bill.dto';
import { UpdateBillDto } from './UpdateBillDto';

const APPROVED_PROVIDERS = ['NEPA', 'MTN', 'GLO', 'University of Lagos'];

@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBillDto) {
    if (!APPROVED_PROVIDERS.includes(dto.provider)) {
      throw new Error('Provider not approved');
    }

    return this.prisma.bill.create({
      data: {
        ...dto,
        userId,
        status: 'PENDING',
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.bill.findMany({ where: { userId } });
  }

  findOne(userId: string, id: string) {
    return this.prisma.bill.findFirst({ where: { id, userId } });
  }

  async update(userId: string, id: string, dto: UpdateBillDto) {
    const bill = await this.findOne(userId, id);
    if (!bill) throw new NotFoundException('Bill not found');

    return this.prisma.bill.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const bill = await this.findOne(userId, id);
    if (!bill) throw new NotFoundException('Bill not found');

    return this.prisma.bill.delete({ where: { id } });
  }
}