export interface Item {
  id: number;
  nombre: string;
  rareza: string;
  tipo: string;
  bonusFuerza: number;
  estaEquipado: boolean;
}

export interface Jugador {
  id: number;
  nombre: string;
  fuerza: number;
  energia: number;
  oro: number;
  nivel: number;
  inventario: Item[];
  experiencia?: number;
}

export interface BattleLog {
  log: string[];
  resultado: string;
}

export interface ServerResponse<T = Record<string, never>> {
  mensaje: string;
  estado: Jugador;
  log?: string[];
  resultado?: string;
  ranking?: Jugador[];
  extra?: T;
}

export interface RankingEntry extends Jugador {
  fuerzaTotal?: number;
  esJugador?: boolean;
}
