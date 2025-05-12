import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBillDto } from '../dto/CreateBillDto';
import { UpdateBillDto } from '../dto/UpdateBillDto';
import { PrismaService } from '../service/prisma.service';

@Injectable()
export class BillService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBillDto): Promise<any> {
    console.log('dueDate (before Prisma):', dto.dueDate);

    // Check if the provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider) {
      const providersCount = await this.prisma.provider.count();
      if (providersCount === 0) {
        throw new NotFoundException('No providers exist in the database. Please add a provider first.');
      }
      throw new NotFoundException('Provider not found');
    }

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const dueDate = new Date(dto.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid dueDate format');
    }

    // Create the bill
    return this.prisma.bill.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        dueDate, // Use the transformed Date object
        userId: userId, // Use `userId` here
        providerId: dto.providerId || '',
        paymentStatus: 'PENDING', // Add a default paymentStatus value
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
    console.log('Finding bill with:', { userId, id });
    return this.prisma.bill.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateBillDto): Promise<any> {
    const bill = await this.findOne(userId, id);
    if (!bill) throw new NotFoundException('Bill not found');

    return this.prisma.bill.update({ where: { id }, data: dto });
  }

  async delete(id: string): Promise<any | null> {
    const bill = await this.prisma.bill.delete({
      where: { id },
    }).catch(() => null); // Return null if the bill does not exist
    return bill;
  }

  getBills() {
    return { message: 'List of bills' };
  }
}