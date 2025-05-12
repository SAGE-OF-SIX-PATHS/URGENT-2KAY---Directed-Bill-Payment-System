import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProvidersService } from '../service/provider.service'; // Import ProvidersService
import { CreateProviderDto } from '../dto/CreatProviderDto';
import { PrismaService } from '../service/prisma.service'; // Import PrismaService

@Controller('providers')
export class ProviderController {
  constructor(private providersService: ProvidersService, private readonly prisma: PrismaService) {}

  // Endpoint to create a provider
  @Post()
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto);
  }

  // Endpoint to retrieve all providers
  @Get()
  async findAll() {
    return this.providersService.findAll();
  }

  // Endpoint to create provider with DTO
  @Post('with-dto')
  async createWithDto(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto);
  }

  @Get()
  async getProviders(@Query('type') type: string) {
    if (!type) {
      return { message: 'Provider type is required', providers: [] };
    }

    const providers = await this.prisma.provider.findMany({
      where: { type },
    });

    return { message: `Providers for ${type}`, providers };
  }
}