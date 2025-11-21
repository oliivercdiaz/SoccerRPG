import axios from 'axios';
import type { Item, Jugador, RankingEntry, ServerResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

const markRanking = (ranking: Jugador[], jugador?: Jugador): RankingEntry[] =>
  ranking.map((entry) => ({
    ...entry,
    esJugador: jugador ? entry.id === jugador.id : false,
  }));

export const JuegoService = {
  async getProfile(): Promise<ServerResponse> {
    const { data } = await api.get<ServerResponse>('/jugador');
    return data;
  },
  async train(): Promise<ServerResponse> {
    const { data } = await api.get<ServerResponse>('/entrenar');
    return data;
  },
  async rest(): Promise<ServerResponse> {
    const { data } = await api.get<ServerResponse>('/descansar');
    return data;
  },
  async openChest(): Promise<ServerResponse<{ item?: Item }>> {
    const { data } = await api.get<ServerResponse<{ item?: Item }>>('/cofre');
    return data;
  },
  async sellItem(id: number): Promise<ServerResponse<{ oroGanado?: number }>> {
    const { data } = await api.get<ServerResponse<{ oroGanado?: number }>>(`/items/${id}/vender`);
    return data;
  },
  async equipItem(id: number, equipar: boolean): Promise<ServerResponse> {
    const { data } = await api.get<ServerResponse>(`/items/${id}/equipar`, { params: { equipar } });
    return data;
  },
  async playLeague(): Promise<ServerResponse<{ rival?: number }>> {
    const { data } = await api.get<ServerResponse<{ rival?: number }>>('/liga');
    return data;
  },
  async playDungeon(): Promise<ServerResponse<{ boss?: number; botin?: Item }>> {
    const { data } = await api.get<ServerResponse<{ boss?: number; botin?: Item }>>('/mazmorra');
    return data;
  },
  async getRanking(jugador?: Jugador): Promise<RankingEntry[]> {
    const { data } = await api.get<ServerResponse<{ ranking: Jugador[] }>>('/ranking');
    const listado = data.ranking ?? [];
    return markRanking(listado, jugador ?? data.estado);
  },
  async generateBots(jugador?: Jugador): Promise<RankingEntry[]> {
    const { data } = await api.get<ServerResponse<{ ranking: Jugador[] }>>('/ranking/bots');
    const listado = data.ranking ?? [];
    return markRanking(listado, jugador ?? data.estado);
  },
};
