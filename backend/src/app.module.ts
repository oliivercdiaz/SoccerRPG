import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Jugador } from './jugador.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'juego.sqlite', // Aquí se guardarán los datos
      entities: [Jugador],
      synchronize: true, // ¡Crea las tablas automáticamente!
    }),
    TypeOrmModule.forFeature([Jugador]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}