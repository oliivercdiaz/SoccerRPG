import { useMemo } from 'react';
import { ItemCard } from '../components/ItemCard';
import { AudioService } from '../services/audio';
import { JuegoService } from '../services/api';
import type { Item, Jugador, RankingEntry, ServerResponse } from '../types';

interface GamePageProps {
  jugador: Jugador;
  fuerzaTotal: number;
  mensaje: string;
  ranking: RankingEntry[];
  botsGenerados: boolean;
  cargando: boolean;
  vista: 'club' | 'ranking';
  onVistaChange: (vista: 'club' | 'ranking') => void;
  onResponse: (respuesta: ServerResponse<any>) => Promise<void>;
  onRankingChange: (ranking: RankingEntry[]) => void;
  onBotsGenerados: () => void;
  setCargando: (valor: boolean) => void;
  onErrorMessage: (mensaje: string) => void;
}

export const GamePage = ({
  jugador,
  fuerzaTotal,
  mensaje,
  ranking,
  botsGenerados,
  cargando,
  vista,
  onVistaChange,
  onResponse,
  onRankingChange,
  onBotsGenerados,
  setCargando,
  onErrorMessage,
}: GamePageProps) => {
  const avatarUrl = useMemo(() => `https://robohash.org/${jugador.nombre}.png?set=set2`, [jugador.nombre]);

  const equipados = jugador.items.filter((item) => item.estaEquipado);
  const mochila = jugador.items.filter((item) => !item.estaEquipado);

  const ejecutarAccion = async <T = Record<string, never>>(
    accion: () => Promise<ServerResponse<T>>,
    onSuccess?: (respuesta: ServerResponse<T>) => void,
  ) => {
    setCargando(true);
    AudioService.click();
    try {
      const respuesta = await accion();
      await onResponse(respuesta);
      onSuccess?.(respuesta);
    } catch (error) {
      onErrorMessage('❌ Error: el servidor no responde.');
      AudioService.defeat();
    } finally {
      setCargando(false);
    }
  };

  const entrenar = () =>
    ejecutarAccion(async () => JuegoService.entrenar(), (respuesta) => {
      if (respuesta.resultado === 'Crítico') {
        AudioService.success();
      }
    });

  const descansar = () => ejecutarAccion(() => JuegoService.descansar());

  const abrirCofre = () =>
    ejecutarAccion(async () => JuegoService.abrirCofre(), (respuesta) => {
      if (respuesta.resultado === 'legendario') {
        AudioService.success();
      }
    });

  const jugarLiga = () =>
    ejecutarAccion(async () => JuegoService.jugarLiga(), (respuesta) => {
      if (respuesta.extra?.resultadoCombate === 'Victoria') {
        AudioService.success();
      } else {
        AudioService.defeat();
      }
    });

  const jugarMazmorra = () =>
    ejecutarAccion(async () => JuegoService.jugarMazmorra(), (respuesta) => {
      if (respuesta.extra?.resultadoCombate === 'Victoria') {
        AudioService.success();
      } else {
        AudioService.defeat();
      }
    });

  const equiparItem = (id: number, equipar: boolean) => ejecutarAccion(() => JuegoService.equiparItem(id, equipar));

  const venderItem = (id: number) => ejecutarAccion(() => JuegoService.venderItem(id));

  const reclamarMision = () =>
    ejecutarAccion(async () => JuegoService.reclamarMision(), (respuesta) => {
      if ((respuesta.extra?.recompensa ?? 0) > 0) {
        AudioService.success();
      }
    });

  const generarBots = async () => {
    setCargando(true);
    AudioService.click();
    try {
      const rankingData = await JuegoService.generarBots();
      onBotsGenerados();
      const jugadorActual = await JuegoService.obtenerJugador();
      await onResponse(jugadorActual);
      const rankingMarcado = rankingData.map((entry) => ({ ...entry, esJugador: entry.id === jugadorActual.estado.id }));
      onRankingChange(rankingMarcado);
    } catch (error) {
      onErrorMessage('No se pudieron generar bots.');
      AudioService.defeat();
    } finally {
      setCargando(false);
    }
  };

  const renderInventario = (items: Item[], titulo: string) => (
    <div className="items-section">
      <h3>{titulo}</h3>
      {items.length === 0 ? (
        <div className="empty">Vacío</div>
      ) : (
        <div className="items-list">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEquipar={(id) => equiparItem(id, true)}
              onDesequipar={(id) => equiparItem(id, false)}
              onVender={venderItem}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      <nav className="tabs">
        <button className={`tab ${vista === 'club' ? 'activo' : ''}`} onClick={() => onVistaChange('club')}>
          MI CLUB
        </button>
        <button className={`tab ${vista === 'ranking' ? 'activo' : ''}`} onClick={() => onVistaChange('ranking')}>
          RANKING
        </button>
      </nav>

      {vista === 'club' && (
        <>
          <header className="panel hero">
            <div className="avatar-block">
              <img className="avatar" src={avatarUrl} alt="Avatar" />
              <div className="nivel">Nivel {jugador.nivel}</div>
            </div>
            <div className="stats">
              <div className="stat-row">
                <span>💪 Fuerza total</span>
                <strong>{fuerzaTotal}</strong>
              </div>
              <div className="stat-row">
                <span>⚡ Energía</span>
                <div className="barra">
                  <div className="barra-energia" style={{ width: `${jugador.energia}%` }}></div>
                </div>
                <span className="detalle">{jugador.energia} / 100</span>
              </div>
              <div className="stat-row">
                <span>🎖️ XP</span>
                <div className="barra">
                  <div className="barra-xp" style={{ width: `${jugador.experiencia % 100}%` }}></div>
                </div>
                <span className="detalle">{jugador.experiencia} xp</span>
              </div>
              <div className="stat-row">
                <span>💰 Oro</span>
                <strong>{jugador.oro}</strong>
              </div>
            </div>
            <div className="acciones-principales">
              <button className="btn" onClick={entrenar} disabled={jugador.energia < 10 || cargando}>
                🏋️ Entrenar
              </button>
              <button className="btn" onClick={descansar} disabled={jugador.energia >= 100 || cargando}>
                💤 Descansar (+energía)
              </button>
              <button className="btn" onClick={abrirCofre} disabled={cargando}>
                🗝️ Abrir cofre
              </button>
              <button className="btn" onClick={jugarLiga} disabled={jugador.energia < 15 || cargando}>
                🏆 Jugar liga (-15⚡)
              </button>
              <button className="btn" onClick={jugarMazmorra} disabled={jugador.energia < 25 || cargando}>
                🐉 Mazmorra (-25⚡)
              </button>
              <button className="btn" onClick={reclamarMision} disabled={cargando}>
                📜 Misión diaria ({jugador.entrenos_hoy}/5)
              </button>
            </div>
          </header>

          <section className="panel mensaje">"{mensaje}"</section>

          <section className="panel grid">
            <div className="col">
              <h2>Equipo</h2>
              <div className="equipado-grid">
                <div className="slot">👟 {equipados.find((i) => i.tipo === 'Botas')?.nombre ?? 'Sin botas equipadas'}</div>
                <div className="slot">👕 {equipados.find((i) => i.tipo === 'Camiseta')?.nombre ?? 'Sin camiseta equipada'}</div>
              </div>
              {renderInventario(equipados, 'Equipados')}
              {renderInventario(mochila, 'Mochila')}
            </div>

            <div className="col">
              <h2>Ranking</h2>
              {!botsGenerados && (
                <button className="btn secondary" onClick={generarBots} disabled={cargando}>
                  GENERAR BOTS
                </button>
              )}
              <div className="tabla">
                <div className="tabla-header">
                  <span>Nombre</span>
                  <span>Fuerza</span>
                </div>
                {ranking.map((r) => (
                  <div key={r.id} className={`tabla-row ${r.esJugador ? 'activo' : ''}`}>
                    <span>{r.nombre}</span>
                    <span>{r.fuerzaTotal}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {vista === 'ranking' && (
        <section className="panel ranking-view">
          <header className="ranking-header">
            <div>
              <h2>Tabla de clasificación</h2>
              <p>Compite para ver tu posición frente a otros clubs.</p>
            </div>
            {!botsGenerados && (
              <button className="btn secondary" onClick={generarBots} disabled={cargando}>
                GENERAR BOTS
              </button>
            )}
          </header>
          <div className="tabla">
            <div className="tabla-header">
              <span>Nombre</span>
              <span>Fuerza</span>
            </div>
            {ranking.map((r) => (
              <div key={r.id} className={`tabla-row ${r.esJugador ? 'activo' : ''}`}>
                <span>{r.nombre}</span>
                <span>{r.fuerzaTotal}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
