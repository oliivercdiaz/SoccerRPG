export interface Item {
  id: number;
  nombre: string;
  tipo: string;
  poder: number;
  valor: number;
  rareza: string;
  estaEquipado: boolean;
}

export interface Jugador {
  id: number;
  nombre: string;
  fuerzaBase: number;
  energia: number;
  experiencia: number;
  nivel: number;
  oro: number;
  cofres_abiertos_desde_legendario: number;
  entrenos_hoy: number;
  entrenos_fecha: string;
  ultima_mision: string;
  items: Item[];
}

export interface ServerResponse<T = Record<string, never>> {
  mensaje: string;
  resultado?: string;
  estado: Jugador;
  fuerzaTotal?: number;
  extra?: T;
}

export interface RankingEntry {
  id: number;
  nombre: string;
  fuerzaTotal: number;
  esJugador?: boolean;
}
