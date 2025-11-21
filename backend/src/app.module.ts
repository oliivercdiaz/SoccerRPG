import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Jugador } from './jugador.entity';
import { Item } from './item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'juego.sqlite',
      entities: [Jugador, Item],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Jugador, Item]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
