import { Injectable, Module } from '@nestjs/common';
import { CreateProviderDto } from '../dto/CreatProviderDto';
import { PrismaService } from './prisma.service';
// Removed conflicting import of ProvidersService
import { ProviderController } from '../controllers/provider.controller';


@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  // This method creates a new provider in the database
  async create(createProviderDto: CreateProviderDto) {
    return this.prisma.provider.create({
      data: {
        name: createProviderDto.name,
      },
    });
  }

  // Retrieve all providers from the database
  async findAll() {
    return this.prisma.provider.findMany();
  }

  // Retrieve a single provider by its ID
  async findOne(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
    });
  }
}

@Module({
  imports: [], // If needed, import other modules here
  providers: [ProvidersService, PrismaService], // Add ProvidersService here
  controllers: [ProviderController], // Ensure the controller is listed here
})

export class ProviderModule {}