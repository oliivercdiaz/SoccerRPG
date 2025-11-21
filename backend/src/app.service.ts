import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Jugador } from './jugador.entity';
import { Item } from './item.entity';

export interface ServerResponse<T = Record<string, never>> {
  mensaje: string;
  estado: Jugador;
  resultado?: string;
  fuerzaTotal?: number;
  extra?: T;
}

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Jugador)
    private jugadorRepo: Repository<Jugador>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
  ) {}

  getHello() {
    return { mensaje: 'Servidor listo.' };
  }

  private calcularFuerzaTotal(jugador: Jugador): number {
    const base = jugador.fuerzaBase ?? 0;
    const equipado = (jugador.items ?? [])
      .filter((item) => item.estaEquipado)
      .reduce((total, item) => total + item.poder, 0);
    return base + equipado;
  }

  private async asegurarDia(jugador: Jugador): Promise<Jugador> {
    const hoy = new Date().toISOString().split('T')[0];
    if (jugador.entrenos_fecha !== hoy) {
      jugador.entrenos_fecha = hoy;
      jugador.entrenos_hoy = 0;
      jugador.ultima_mision = '';
      await this.jugadorRepo.save(jugador);
    }
    return jugador;
  }

  private async crearJugadorBase(): Promise<Jugador> {
    const jugador = this.jugadorRepo.create({
      nombre: 'Oliver',
      fuerzaBase: 10,
      energia: 100,
      experiencia: 0,
      nivel: 1,
      oro: 50,
      entrenos_fecha: new Date().toISOString().split('T')[0],
    });

    const botas = this.itemRepo.create({
      nombre: 'Botas Viejas',
      tipo: 'Botas',
      poder: 2,
      valor: 15,
      rareza: 'comun',
      estaEquipado: true,
      jugador,
    });

    const camiseta = this.itemRepo.create({
      nombre: 'Camiseta Desgastada',
      tipo: 'Camiseta',
      poder: 1,
      valor: 10,
      rareza: 'comun',
      estaEquipado: true,
      jugador,
    });

    jugador.items = [botas, camiseta];
    await this.jugadorRepo.save(jugador);
    await this.itemRepo.save([botas, camiseta]);
    return jugador;
  }

  async obtenerJugador(): Promise<Jugador> {
    let jugador = await this.jugadorRepo.findOne({
      where: { id: 1 },
      relations: ['items'],
    });

    if (!jugador) {
      jugador = await this.crearJugadorBase();
    }

    return this.asegurarDia(jugador);
  }

  async entrenar(): Promise<ServerResponse> {
    const jugador = await this.obtenerJugador();

    if (jugador.energia < 10) {
      return {
        mensaje: '¡Estás agotado! Necesitas descansar (o café).',
        estado: jugador,
        fuerzaTotal: this.calcularFuerzaTotal(jugador),
      };
    }

    jugador.energia -= 10;
    jugador.experiencia += 10;
    jugador.entrenos_hoy += 1;

    const suerte = Math.random();
    let mensaje = 'Entrenamiento completado.';
    let ganancia = 'Normal';

    if (suerte > 0.8) {
      jugador.fuerzaBase += 3;
      mensaje = '¡CRÍTICO! Te sientes imparable.';
      ganancia = 'Crítico';
    } else {
      jugador.fuerzaBase += 1;
    }

    await this.jugadorRepo.save(jugador);

    return {
      mensaje,
      resultado: ganancia,
      estado: await this.obtenerJugador(),
      fuerzaTotal: this.calcularFuerzaTotal(jugador),
    };
  }

  async obtenerEstado(): Promise<ServerResponse> {
    const jugador = await this.obtenerJugador();
    return {
      mensaje: 'Estado recuperado',
      estado: jugador,
      fuerzaTotal: this.calcularFuerzaTotal(jugador),
    };
  }

  async equiparItem(itemId: number, equipar: boolean): Promise<ServerResponse> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['jugador', 'jugador.items'],
    });

    if (!item) {
      throw new Error('El item no existe');
    }

    const jugador = await this.asegurarDia(item.jugador);

    if (equipar) {
      const mismosTipo = jugador.items.filter((i) => i.tipo === item.tipo && i.id !== item.id);
      for (const existente of mismosTipo) {
        if (existente.estaEquipado) {
          existente.estaEquipado = false;
        }
      }
      item.estaEquipado = true;
      await this.itemRepo.save([...mismosTipo, item]);
    } else {
      item.estaEquipado = false;
      await this.itemRepo.save(item);
    }

    const actualizado = await this.jugadorRepo.findOne({ where: { id: jugador.id }, relations: ['items'] });

    return {
      mensaje: equipar ? 'Item equipado.' : 'Item desequipado.',
      estado: actualizado!,
      fuerzaTotal: this.calcularFuerzaTotal(actualizado!),
    };
  }

  async venderItem(itemId: number): Promise<ServerResponse<{ oroGanado: number }>> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['jugador', 'jugador.items'],
    });

    if (!item) {
      throw new Error('El item no existe');
    }

    const jugador = item.jugador;
    jugador.oro += item.valor;
    jugador.items = jugador.items.filter((i) => i.id !== item.id);
    await this.itemRepo.remove(item);
    await this.jugadorRepo.save(jugador);

    const actualizado = await this.jugadorRepo.findOne({ where: { id: jugador.id }, relations: ['items'] });

    return {
      mensaje: 'Has vendido el item.',
      estado: actualizado!,
      fuerzaTotal: this.calcularFuerzaTotal(actualizado!),
      extra: { oroGanado: item.valor },
    };
  }

  private generarItemAleatorio(jugador: Jugador, rareza: string): Item {
    const tipos = ['Botas', 'Camiseta', 'Espada', 'Guantes'];
    const multiplicador = rareza === 'legendario' ? 4 : rareza === 'raro' ? 2 : 1;
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const poderBase = 2 + Math.floor(Math.random() * 4);
    const valor = 20 + Math.floor(Math.random() * 20);

    return this.itemRepo.create({
      nombre: `${tipo} ${rareza}`,
      tipo,
      poder: poderBase * multiplicador,
      valor: valor * multiplicador,
      rareza,
      estaEquipado: false,
      jugador,
    });
  }

  async abrirCofre(): Promise<ServerResponse<{ item: Item }>> {
    const jugador = await this.obtenerJugador();

    const pity = jugador.cofres_abiertos_desde_legendario;
    let probLegendarioExtra = 0;
    if (pity > 50) {
      const factor = Math.pow((pity - 50) / 10 + 1, 2);
      probLegendarioExtra = Math.min(0.6, factor * 0.05);
    }

    const baseRoll = Math.random();
    const esLegendario = baseRoll < 0.1 + probLegendarioExtra;
    const rareza = esLegendario ? 'legendario' : baseRoll < 0.4 ? 'raro' : 'comun';

    const item = this.generarItemAleatorio(jugador, rareza);

    if (esLegendario) {
      jugador.cofres_abiertos_desde_legendario = 0;
    } else {
      jugador.cofres_abiertos_desde_legendario += 1;
    }

    await this.itemRepo.save(item);
    jugador.items.push(item);
    await this.jugadorRepo.save(jugador);

    const actualizado = await this.jugadorRepo.findOne({ where: { id: jugador.id }, relations: ['items'] });

    return {
      mensaje: esLegendario ? '¡Legendario encontrado!' : 'Nuevo botín añadido a la mochila.',
      resultado: rareza,
      estado: actualizado!,
      fuerzaTotal: this.calcularFuerzaTotal(actualizado!),
      extra: { item },
    };
  }

  private async calcularRanking(): Promise<Array<{ nombre: string; fuerzaTotal: number; id: number }>> {
    const jugadores = await this.jugadorRepo.find({ relations: ['items'] });
    return jugadores
      .map((j) => ({ nombre: j.nombre, id: j.id, fuerzaTotal: this.calcularFuerzaTotal(j) }))
      .sort((a, b) => b.fuerzaTotal - a.fuerzaTotal);
  }

  async obtenerRanking(): Promise<{ ranking: Array<{ nombre: string; fuerzaTotal: number; id: number }> }> {
    return { ranking: await this.calcularRanking() };
  }

  async generarBots(): Promise<{ mensaje: string; ranking: Array<{ nombre: string; fuerzaTotal: number; id: number }> }> {
    const jugadoresActuales = await this.jugadorRepo.count();
    if (jugadoresActuales > 1) {
      return { mensaje: 'Los bots ya fueron generados.', ranking: await this.calcularRanking() };
    }

    const bots: Jugador[] = [];
    for (let i = 0; i < 5; i++) {
      const bot = this.jugadorRepo.create({
        nombre: `Bot_${i + 1}`,
        fuerzaBase: 8 + i * 3,
        energia: 100,
        nivel: 1,
        experiencia: 0,
        oro: 20,
        entrenos_fecha: new Date().toISOString().split('T')[0],
      });
      bot.items = [
        this.itemRepo.create({ nombre: 'Botas de Entrenamiento', tipo: 'Botas', poder: 2 + i, valor: 10, rareza: 'comun', estaEquipado: true, jugador: bot }),
      ];
      bots.push(bot);
    }

    await this.jugadorRepo.save(bots);
    for (const bot of bots) {
      await this.itemRepo.save(bot.items);
    }

    return { mensaje: 'Bots generados', ranking: await this.calcularRanking() };
  }

  async reclamarMision(): Promise<ServerResponse<{ recompensa: number }>> {
    const jugador = await this.obtenerJugador();
    const hoy = new Date().toISOString().split('T')[0];

    if (jugador.entrenos_hoy < 5) {
      return {
        mensaje: 'Entrena 5 veces para reclamar la recompensa diaria.',
        estado: jugador,
        fuerzaTotal: this.calcularFuerzaTotal(jugador),
        extra: { recompensa: 0 },
      };
    }

    if (jugador.ultima_mision === hoy) {
      return {
        mensaje: 'Ya reclamaste la misión diaria.',
        estado: jugador,
        fuerzaTotal: this.calcularFuerzaTotal(jugador),
        extra: { recompensa: 0 },
      };
    }

    const recompensa = 75;
    jugador.oro += recompensa;
    jugador.ultima_mision = hoy;
    await this.jugadorRepo.save(jugador);

    return {
      mensaje: 'Misión diaria completada.',
      estado: jugador,
      fuerzaTotal: this.calcularFuerzaTotal(jugador),
      extra: { recompensa },
    };
  }
}
