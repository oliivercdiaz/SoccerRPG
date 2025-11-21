import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('jugador')
  obtenerJugador() {
    return this.appService.obtenerEstado();
  }

  @Post('entrenar')
  realizarEntrenamiento() {
    return this.appService.entrenar();
  }

  @Post('cofre')
  abrirCofre() {
    return this.appService.abrirCofre();
  }

  @Patch('items/:id/equipar')
  equipar(@Param('id') id: string, @Body('equipar') equipar: boolean) {
    return this.appService.equiparItem(Number(id), equipar);
  }

  @Post('items/:id/vender')
  vender(@Param('id') id: string) {
    return this.appService.venderItem(Number(id));
  }

  @Get('ranking')
  ranking() {
    return this.appService.obtenerRanking();
  }

  @Post('ranking/bots')
  generarBots() {
    return this.appService.generarBots();
  }

  @Post('mision')
  reclamarMision() {
    return this.appService.reclamarMision();
  }
}
