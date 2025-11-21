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
  const energiaPct = Math.min(100, Math.max(0, jugador.energia));
  const xpPct = jugador.experiencia % 100;

  const equipados = jugador.items.filter((item) => item.estaEquipado);
  const mochila = jugador.items.filter((item) => !item.estaEquipado);
  const bonusEquipado = equipados.reduce((acc, item) => acc + item.poder, 0);

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
      const jugadorActual = await JuegoService.obtenerJugador();
      await onResponse(jugadorActual);
      const rankingMarcado = rankingData.map((entry) => ({ ...entry, esJugador: entry.id === jugadorActual.estado.id }));
      onRankingChange(rankingMarcado);
      onBotsGenerados();
    } catch (error) {
      onErrorMessage('No se pudieron generar bots.');
      AudioService.defeat();
    } finally {
      setCargando(false);
    }
  };

  const renderSlot = (tipo: string, icono: string) => {
    const item = equipados.find((i) => i.tipo === tipo);
    return (
      <div className="gear-slot">
        <h4>{icono} {tipo}</h4>
        {item ? (
          <div className="gear-item">
            <div>
              <div className="item-title">{item.nombre}</div>
              <div className="item-meta">+{item.poder} poder • {item.rareza}</div>
            </div>
            <button className="btn ghost" onClick={() => equiparItem(item.id, false)}>
              ⬇️ Desequipar
            </button>
          </div>
        ) : (
          <div className="gear-item empty">Vacío</div>
        )}
      </div>
    );
  };

  const renderInventario = (items: Item[], titulo: string) => (
    <div className="inventario">
      <div className="section-header">
        <h3>{titulo}</h3>
        <span className="detalle">{items.length} objetos</span>
      </div>
      <div className="inventario-grid">
        {items.length === 0 && <p className="detalle">Sin objetos aquí.</p>}
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
    </div>
  );

  return (
    <div className="app">
      <header className="tabs">
        <div className="tab-group">
          <button className={`tab ${vista === 'club' ? 'activo' : ''}`} onClick={() => onVistaChange('club')}>
            MI CLUB
          </button>
          <button className={`tab ${vista === 'ranking' ? 'activo' : ''}`} onClick={() => onVistaChange('ranking')}>
            RANKING
          </button>
        </div>
        <div className="chip banner">La potencia proviene de lo equipado, estilo Shakes & Fidget.</div>
      </header>

      {vista === 'club' && (
        <>
          <section className="panel hero full">
            <div className="hero-left">
              <img className="avatar" src={avatarUrl} alt={jugador.nombre} />
              <div className="nivel-card">
                <span className="nivel">Nivel {jugador.nivel}</span>
                <span className="detalle">{jugador.nombre}</span>
              </div>
            </div>
            <div className="hero-center">
              <div className="stat-row">
                <span className="detalle">Fuerza total</span>
                <div className="barra">
                  <div className="barra-xp" style={{ width: `${Math.min(100, (fuerzaTotal / Math.max(100, fuerzaTotal)) * 100)}%` }}></div>
                </div>
                <strong>{fuerzaTotal}</strong>
              </div>
              <div className="stat-row">
                <span className="detalle">Energía</span>
                <div className="barra">
                  <div className="barra-energia" style={{ width: `${energiaPct}%` }}></div>
                </div>
                <strong>{jugador.energia}/100</strong>
              </div>
              <div className="stat-row">
                <span className="detalle">Experiencia</span>
                <div className="barra">
                  <div className="barra-xp" style={{ width: `${xpPct}%` }}></div>
                </div>
                <strong>{jugador.experiencia} xp</strong>
              </div>
              <div className="chip-group">
                <span className="chip">Oro: {jugador.oro}💰</span>
                <span className="chip">Pity: {jugador.cofres_abiertos_desde_legendario} cofres</span>
                <span className="chip banner">+{bonusEquipado} poder equipado</span>
              </div>
            </div>
            <div className="hero-right">
              <div className="panel info-card">
                <p className="detalle">"{mensaje}"</p>
                <p className="detalle">Mantén energía alta para cadena de victorias.</p>
              </div>
              {!botsGenerados && (
                <button className="btn tertiary full" onClick={generarBots} disabled={cargando}>
                  GENERAR BOTS
                </button>
              )}
            </div>
          </section>

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
            <div className="action-grid single">
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
            </div>
            <div className="mission-card wide">
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
          </section>

          <section className="panel mensaje grande">"{mensaje}"</section>

          <section className="panel equipo-panel">
            <div className="section-header">
              <h2>Equipo & Inventario</h2>
              <span className="detalle">Solo cuenta lo equipado. Arriba los slots, abajo la mochila.</span>
            </div>
            <div className="gear-board compact">
              {renderSlot('Camiseta', '👕')}
              {renderSlot('Botas', '👟')}
              <div className="gear-slot">
                <h4>Refuerzo total</h4>
                <div className="gear-item">+{bonusEquipado} poder</div>
                <span className="detalle">Se suma solo lo equipado al cómputo final</span>
              </div>
            </div>
            {renderInventario(equipados, 'Equipados')}
            {renderInventario(mochila, 'Mochila')}
          </section>

          <section className="panel ranking-panel full-width">
            <div className="section-header">
              <h2>Ranking</h2>
              {!botsGenerados && (
                <button className="btn tertiary" onClick={generarBots} disabled={cargando}>
                  GENERAR BOTS
                </button>
              )}
            </div>
            <div className="tabla grande">
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
          <div className="tabla grande">
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
