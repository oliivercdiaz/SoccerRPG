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
  layout: 'web' | 'steam' | 'compact';
  onVistaChange: (vista: 'club' | 'ranking') => void;
  onLayoutChange: (layout: 'web' | 'steam' | 'compact') => void;
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
  layout,
  onVistaChange,
  onLayoutChange,
  onResponse,
  onRankingChange,
  onBotsGenerados,
  setCargando,
  onErrorMessage,
}: GamePageProps) => {
  const avatarUrl = useMemo(() => `https://robohash.org/${jugador.nombre}.png?set=set2`, [jugador.nombre]);
  const energiaPct = Math.min(100, Math.max(0, jugador.energia));
  const xpPct = jugador.experiencia % 100;

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
    <div className={`app theme-${layout}`}>
      <nav className="tabs">
        <div className="tab-group">
          <button className={`tab ${vista === 'club' ? 'activo' : ''}`} onClick={() => onVistaChange('club')}>
            MI CLUB
          </button>
          <button className={`tab ${vista === 'ranking' ? 'activo' : ''}`} onClick={() => onVistaChange('ranking')}>
            RANKING
          </button>
        </div>
        <div className="layout-switcher" aria-label="Cambiar apariencia">
          {[
            { id: 'web', label: 'Web' },
            { id: 'steam', label: 'Steam' },
            { id: 'compact', label: 'Compacta' },
          ].map((modo) => (
            <button
              key={modo.id}
              className={`chip ${layout === modo.id ? 'activo' : ''}`}
              onClick={() => onLayoutChange(modo.id as typeof layout)}
            >
              {modo.label}
            </button>
          ))}
        </div>
      </nav>

      {vista === 'club' && (
        <>
          <header className="panel hero">
            <div className="avatar-block">
              <img className="avatar" src={avatarUrl} alt="Avatar" />
              <div className="nivel">Nivel {jugador.nivel}</div>
              <div className="pill ghost">{jugador.nombre}</div>
            </div>
            <div className="stats">
              <div className="stat-row">
                <span>💪 Fuerza total</span>
                <strong>{fuerzaTotal}</strong>
                <span className="detalle">Base {jugador.fuerzaBase}</span>
              </div>
              <div className="stat-row">
                <span>⚡ Energía</span>
                <div className="barra">
                  <div className="barra-energia" style={{ width: `${energiaPct}%` }}></div>
                </div>
                <span className="detalle">{jugador.energia} / 100</span>
              </div>
              <div className="stat-row">
                <span>🎖️ XP</span>
                <div className="barra">
                  <div className="barra-xp" style={{ width: `${xpPct}%` }}></div>
                </div>
                <span className="detalle">{jugador.experiencia} xp</span>
              </div>
            </div>
            <div className="loot-panel">
              <div className="pill gold">💰 Oro {jugador.oro}</div>
              <div className="pill ghost">Cofres sin legendario: {jugador.cofres_abiertos_desde_legendario}</div>
              <div className="pill ghost">Entrenos de hoy: {jugador.entrenos_hoy}/5</div>
            </div>
          </header>

          <section className="panel action-panel">
            <div className="action-header">
              <div>
                <h2>Campamento</h2>
                <p>Gestiona energía, craftea potencia y lánzate a la batalla.</p>
              </div>
              <div className="chip-group">
                <span className="chip subtle">☀️ Día a día: mantén energía</span>
                <span className="chip subtle">⚔️ PvE/PvP listos</span>
              </div>
            </div>
            <div className="action-grid">
              <div className="action-stack">
                <button className="btn" onClick={entrenar} disabled={jugador.energia < 10 || cargando}>
                  🏋️ Entrenar (+xp)
                </button>
                <button className="btn" onClick={descansar} disabled={jugador.energia >= 100 || cargando}>
                  💤 Descansar (+energía)
                </button>
                <button className="btn" onClick={abrirCofre} disabled={cargando}>
                  🗝️ Abrir cofre
                </button>
              </div>
              <div className="action-stack">
                <button className="btn secondary" onClick={jugarLiga} disabled={jugador.energia < 15 || cargando}>
                  🏆 Jugar liga (-15⚡)
                </button>
                <button className="btn secondary" onClick={jugarMazmorra} disabled={jugador.energia < 25 || cargando}>
                  🐉 Mazmorra (-25⚡)
                </button>
                <button className="btn ghost" onClick={reclamarMision} disabled={cargando}>
                  📜 Misión diaria ({jugador.entrenos_hoy}/5)
                </button>
              </div>
              <div className="mission-card">
                <div>
                  <p className="mission-title">Misión de hoy</p>
                  <p>Entrena 5 veces y reclama tu botín diario.</p>
                </div>
                <div className="mission-progress">
                  <div className="barra">
                    <div className="barra-xp" style={{ width: `${Math.min(100, (jugador.entrenos_hoy / 5) * 100)}%` }}></div>
                  </div>
                  <span className="detalle">{jugador.entrenos_hoy} / 5 sesiones</span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel mensaje">"{mensaje}"</section>

          <section className="dashboard-grid">
            <div className="panel">
              <div className="section-header">
                <h2>Equipo</h2>
                <span className="detalle">Arrastra tu estilo al nivel Shakes & Fidget</span>
              </div>
              <div className="equipado-grid">
                <div className="slot">👟 {equipados.find((i) => i.tipo === 'Botas')?.nombre ?? 'Sin botas equipadas'}</div>
                <div className="slot">👕 {equipados.find((i) => i.tipo === 'Camiseta')?.nombre ?? 'Sin camiseta equipada'}</div>
              </div>
              {renderInventario(equipados, 'Equipados')}
              {renderInventario(mochila, 'Mochila')}
            </div>

            <div className="panel ranking-panel">
              <div className="section-header">
                <h2>Ranking</h2>
                {!botsGenerados && (
                  <button className="btn tertiary" onClick={generarBots} disabled={cargando}>
                    GENERAR BOTS
                  </button>
                )}
              </div>
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
