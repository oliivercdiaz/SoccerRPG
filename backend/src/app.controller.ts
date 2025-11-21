import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Esta es la puerta principal (localhost:3000)
  @Get()
  getHello() {
    return this.appService.getHello();
  }

  // Esta es la puerta nueva que acabamos de construir (localhost:3000/entrenar)
  @Get('entrenar')
  realizarEntrenamiento() {
    return this.appService.entrenar();
  }
}