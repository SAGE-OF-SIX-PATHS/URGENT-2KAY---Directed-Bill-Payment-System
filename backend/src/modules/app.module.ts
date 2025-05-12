import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma.module'; // Import PrismaModule
import { BillController } from '../controllers/bill.controller';
import { AppController } from '../controllers/app.controller';
import { ProviderController } from '../controllers/provider.controller';
import { BillModule } from './bill.module';
import { ProviderModule } from './provider.module';
import { LoggerMiddleware } from '../middlewares/emailLoggerMiddleware';

@Module({
  imports: [PrismaModule, BillModule, ProviderModule], // Add PrismaModule here
  controllers: [AppController, BillController, ProviderController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*'); // Apply globally to all routes
  }
}
