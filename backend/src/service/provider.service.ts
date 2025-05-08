import { Injectable } from '@nestjs/common';
import { CreateProviderDto } from '../dto/CreatProviderDto';
import { PrismaService } from '../service/prisma.service';
import { Provider } from '@prisma/client';

@Injectable()
export class ProvidersService {
  private _providers = { name: string, id:  }[] = [];  // Simulating a database for now

  // This method creates a new provider
  create(createProviderDto: CreateProviderDto) {
    const newProvider = {
      id: Date.now().toString(), // You can generate a UUID here if needed
      name: createProviderDto.name,
    };
    this._providers.push(newProvider);
    return newProvider;
  }

  // Optional: Add more methods to retrieve or manage providers
  findAll() {
    return this._providers;
  }

  findOne(id: string) {
    return this._providers.find(provider => provider.id === id);
  }
}
