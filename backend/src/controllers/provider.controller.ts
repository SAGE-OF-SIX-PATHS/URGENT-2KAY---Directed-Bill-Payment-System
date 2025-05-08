import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProvidersService } from '../service/provider.service'; // Import ProvidersService
import { CreateProviderDto } from '../dto/CreatProviderDto';

@Controller('providers')
export class ProviderController {
  constructor(private providersService: ProvidersService) {}

  // Endpoint to create a provider
  @Post()
  async create(@Body() body: { name: string }) {
    return this.providersService.create({ name: body.name });
  }

  // Endpoint to retrieve all providers
  @Get()
  async findAll() {
    return this.providersService.findAll();
  }

  // Endpoint to create provider with DTO
  @Post('with-dto')
  async createWithDto(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.create(createProviderDto);
  }
}