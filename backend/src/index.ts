import { ValidationPipe } from '@nestjs/common'; 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Global validation for DTOs
  app.enableShutdownHooks(); // Handle graceful shutdown
  await app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
bootstrap();