import axios from 'axios';
import type { Item, Jugador, RankingEntry, ServerResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const mapRanking = (ranking: Array<{ nombre: string; fuerzaTotal: number; id: number }>, jugador?: Jugador): RankingEntry[] =>
  ranking.map((entry) => ({
    ...entry,
    esJugador: jugador ? entry.id === jugador.id : false,
  }));

export const JuegoService = {
  async obtenerJugador(): Promise<ServerResponse> {
    const { data } = await api.get<ServerResponse>('/jugador');
    return data;
  },
  async entrenar(): Promise<ServerResponse> {
    const { data } = await api.post<ServerResponse>('/entrenar');
    return data;
  },
  async descansar(): Promise<ServerResponse<{ energiaRecuperada: number }>> {
    const { data } = await api.post<ServerResponse<{ energiaRecuperada: number }>>('/descansar');
    return data;
  },
  async abrirCofre(): Promise<ServerResponse<{ item: Item }>> {
    const { data } = await api.post<ServerResponse<{ item: Item }>>('/cofre');
    return data;
  },
  async jugarLiga(): Promise<ServerResponse<{ recompensa: number; rival: number; resultadoCombate: string }>> {
    const { data } = await api.post<ServerResponse<{ recompensa: number; rival: number; resultadoCombate: string }>>('/liga');
    return data;
  },
  async jugarMazmorra(): Promise<ServerResponse<{ recompensa: number; boss: number; resultadoCombate: string; botin?: Item }>> {
    const { data } = await api.post<
      ServerResponse<{ recompensa: number; boss: number; resultadoCombate: string; botin?: Item }>
    >('/mazmorra');
    return data;
  },
  async equiparItem(id: number, equipar: boolean): Promise<ServerResponse> {
    const { data } = await api.patch<ServerResponse>(`/items/${id}/equipar`, { equipar });
    return data;
  },
  async venderItem(id: number): Promise<ServerResponse<{ oroGanado: number }>> {
    const { data } = await api.post<ServerResponse<{ oroGanado: number }>>(`/items/${id}/vender`);
    return data;
  },
  async reclamarMision(): Promise<ServerResponse<{ recompensa: number }>> {
    const { data } = await api.post<ServerResponse<{ recompensa: number }>>('/mision');
    return data;
  },
  async obtenerRanking(jugador?: Jugador): Promise<RankingEntry[]> {
    const { data } = await api.get<{ ranking: Array<{ nombre: string; fuerzaTotal: number; id: number }> }>('/ranking');
    return mapRanking(data.ranking, jugador);
  },
  async generarBots(): Promise<RankingEntry[]> {
    const { data } = await api.post<{ mensaje: string; ranking: Array<{ nombre: string; fuerzaTotal: number; id: number }> }>(
      '/ranking/bots',
    );
    return mapRanking(data.ranking);
  },
};
