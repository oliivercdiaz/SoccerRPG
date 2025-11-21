import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from './jugador.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepo: Repository<Jugador>,
  ) {}

  // Al iniciar, buscamos si existe el jugador. Si no, lo creamos.
  async getHello() {
    return 'Servidor listo.';
  }

  async obtenerJugador() {
    // Buscamos al jugador ID 1
    let jugador = await this.jugadorRepo.findOne({ where: { id: 1 } });
    
    // Si es la primera vez que juegas, te creamos
    if (!jugador) {
      jugador = this.jugadorRepo.create({ nombre: 'Oliver', fuerza: 10, energia: 100 });
      await this.jugadorRepo.save(jugador);
    }
    return jugador;
  }

  async entrenar() {
    // 1. Recuperar al jugador de la DB
    const jugador = await this.obtenerJugador();

    // 2. Validar energía
    if (jugador.energia < 10) {
      return {
        mensaje: "¡Estás agotado! Necesitas descansar (o café).",
        estado: jugador
      };
    }

    // 3. Lógica de juego
    jugador.energia -= 10;
    jugador.experiencia += 10; // ¡Ahora ganas XP!

    const suerte = Math.random();
    let mensaje = "Entrenamiento completado.";
    let ganancia = "Normal";

    if (suerte > 0.8) {
      jugador.fuerza += 3;
      mensaje = "¡CRÍTICO! Te sientes imparable.";
      ganancia = "Crítico";
    } else {
      jugador.fuerza += 1;
    }

    // 4. GUARDAR EN DISCO DURO (Aquí ocurre la magia)
    await this.jugadorRepo.save(jugador);

    return {
      mensaje: mensaje,
      resultado: ganancia,
      estado: jugador
    };
  }
}