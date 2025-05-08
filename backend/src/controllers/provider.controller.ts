import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '../service/prisma.service';
import { CreateProviderDto } from '../dto/CreatProviderDto';

@Controller('providers')
export class ProviderController {
  providersService: any;
  constructor(private prisma: PrismaService) {}

  @Post()
  async create(@Body() body: { name: string }) {
    return this.prisma.provider.create({
      data: {
        name: body.name,
      },
    });
  }

  @Get()
  async findAll() {
    return this.prisma.provider.findMany();
  }

  @Post()
  async createwithdto(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }
}
