import { Injectable, Module } from '@nestjs/common';
import { CreateProviderDto } from '../dto/CreatProviderDto';
import { PrismaService } from './prisma.service';
import { ProviderController as ExternalProviderController } from '../controllers/provider.controller';
import { Controller, Post, Body } from '@nestjs/common';
// Removed redundant import of ProvidersService

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async createProvider(createProviderDto: CreateProviderDto) {
    return this.prisma.provider.create({
      data: {
        name: createProviderDto.name,
        contactInfo: createProviderDto.contactInfo,
      },
    });
  }

  async findAll() {
    return this.prisma.provider.findMany();
  }

  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
    });
  }
}

@Controller('providers')
export class InternalProviderController {
  constructor(private providersService: ProvidersService) {}

  @Post()
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto);
  }
}

@Module({
  imports: [],
  providers: [ProvidersService, PrismaService],
  controllers: [InternalProviderController],
})
export class ProviderModule {}