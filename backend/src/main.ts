import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Esta línea permite que la web (Frontend) hable con el servidor
  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();