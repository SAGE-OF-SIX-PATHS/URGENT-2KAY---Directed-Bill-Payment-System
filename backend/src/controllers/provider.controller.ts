import { Controller, Post, Body } from '@nestjs/common';
import { ProvidersService } from '../service/provider.service';
import { CreateProviderDto } from '../dto/CreatProviderDto';

@Controller('providers')
export class ProviderController {
  constructor(private providersService: ProvidersService) {}

  @Post()
  async create(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto); // Use the correct method name
  }
}