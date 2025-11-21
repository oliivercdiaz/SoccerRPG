import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Aquí guardamos los datos de tu jugador temporalmente
  private jugador = {
    nombre: 'Oliver',
    fuerza: 10,
    energia: 100,
    nivel: 1
  };

  getHello(): string {
    return '¡Bienvenido a SoccerRPG! El servidor está vivo.';
  }

  entrenar() {
    // 1. Si no tiene energía, le avisamos y no entrenamos
    if (this.jugador.energia < 10) {
      return {
        mensaje: "¡Estás agotado! Necesitas descansar.",
        estado: this.jugador
      }
    }

    // 2. Gastamos energía
    this.jugador.energia -= 10;

    // 3. Tiramos los dados (Suerte)
    const suerte = Math.random(); // Número entre 0.0 y 1.0

    // Probabilidad de Crítico (Si saca más de 0.8)
    if (suerte > 0.80) {
      this.jugador.fuerza += 3;
      return {
        mensaje: "¡ENTRENAMIENTO ÉPICO! Has superado tus límites.",
        resultado: "CRÍTICO",
        ganancia: "+3 Fuerza",
        estado: this.jugador
      };
    }

    // Entrenamiento normal
    this.jugador.fuerza += 1;
    return {
      mensaje: "Entrenamiento completado.",
      resultado: "NORMAL",
      ganancia: "+1 Fuerza",
      estado: this.jugador
    };
  }
}