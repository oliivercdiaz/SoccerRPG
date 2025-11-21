import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { GamePage } from './pages/GamePage';
import { JuegoService } from './services/api';
import type { Jugador, RankingEntry, ServerResponse } from './types';

interface BattleLog {
  log: string[];
  resultado: string;
}

const mapRanking = (entries: RankingEntry[], jugador?: Jugador) =>
  entries.map((entry) => ({ ...entry, esJugador: jugador ? entry.id === jugador.id : entry.esJugador }));

function App() {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [fuerzaTotal, setFuerzaTotal] = useState(0);
  const [mensaje, setMensaje] = useState('Cargando vestuario...');
  const [battleLog, setBattleLog] = useState<BattleLog>({ log: [], resultado: '' });
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [botsGenerados, setBotsGenerados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<'club' | 'ranking'>('club');

  const avatarUrl = useMemo(() => `https://robohash.org/${jugador?.nombre ?? 'club'}.png?set=set2`, [jugador?.nombre]);

  const actualizarDesdeRespuesta = async <T = Record<string, never>>(respuesta: ServerResponse<T>) => {
    setJugador(respuesta.estado);
    setFuerzaTotal(respuesta.fuerzaTotal ?? respuesta.estado.fuerzaBase);
    setMensaje(respuesta.mensaje);
    const rankingData = await JuegoService.obtenerRanking(respuesta.estado);
    setRanking(mapRanking(rankingData, respuesta.estado));
  };

  const cargarEstadoInicial = async () => {
    setCargando(true);
    try {
      const data = await JuegoService.obtenerJugador();
      await actualizarDesdeRespuesta(data);
    } catch (error) {
      setMensaje('❌ Error cargando el vestuario.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEstadoInicial();
  }, []);

  const ejecutarAccion = async <T = Record<string, never>>(
    accion: () => Promise<ServerResponse<T>>,
    onSuccess?: (respuesta: ServerResponse<T>) => void,
  ) => {
    setCargando(true);
    try {
      const respuesta = await accion();
      await actualizarDesdeRespuesta(respuesta);
      onSuccess?.(respuesta);
    } catch (error) {
      setMensaje('❌ Error conectando con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const acciones = {
    entrenar: () =>
      ejecutarAccion(() => JuegoService.entrenar(), (resp) => {
        setBattleLog({ log: [resp.mensaje], resultado: '' });
      }),
    descansar: () =>
      ejecutarAccion(() => JuegoService.descansar(), (resp) => {
        setBattleLog({ log: [resp.mensaje], resultado: '' });
      }),
    cofre: () =>
      ejecutarAccion(() => JuegoService.abrirCofre(), (resp) => {
        const lineas = [resp.mensaje];
        if ((resp.extra as any)?.item) {
          lineas.push(`Nuevo: ${(resp.extra as any).item.nombre}`);
        }
        setBattleLog({ log: lineas, resultado: '' });
      }),
    vender: (id: number) =>
      ejecutarAccion(() => JuegoService.venderItem(id), (resp) => {
        setBattleLog({ log: [resp.mensaje], resultado: '' });
      }),
    equipar: (id: number) => {
      if (!jugador) return;
      const actual = jugador.items.find((i) => i.id === id);
      const equipar = actual ? !actual.estaEquipado : true;
      return ejecutarAccion(() => JuegoService.equiparItem(id, equipar), (resp) => {
        setBattleLog({ log: [resp.mensaje], resultado: '' });
      });
    },
    combatir: () =>
      ejecutarAccion(() => JuegoService.jugarLiga(), (resp) => {
        const resultado = (resp.extra as any)?.resultadoCombate ?? '';
        const lineas = [resp.mensaje, resultado ? `Resultado: ${resultado}` : ''].filter(Boolean);
        setBattleLog({ log: lineas, resultado });
      }),
    boss: () =>
      ejecutarAccion(() => JuegoService.jugarMazmorra(), (resp) => {
        const resultado = (resp.extra as any)?.resultadoCombate ?? '';
        const botin = (resp.extra as any)?.botin;
        const lineas = [resp.mensaje, resultado ? `Resultado: ${resultado}` : ''];
        if (botin) {
          lineas.push(`Botín: ${botin.nombre}`);
        }
        setBattleLog({ log: lineas.filter(Boolean), resultado });
      }),
    ranking: () => setVista('ranking'),
  };

  const generarBots = async () => {
    setCargando(true);
    try {
      const data = await JuegoService.generarBots();
      const rankingMarcado = mapRanking(data, jugador ?? undefined);
      setRanking(rankingMarcado);
      setBotsGenerados(true);
      setMensaje('Bots generados');
    } catch (error) {
      setMensaje('No se pudieron generar bots.');
    } finally {
      setCargando(false);
    }
  };

  if (!jugador) return <div className="message-toast">Cargando vestuario...</div>;

  return (
    <div className="game-container">
      <header className="header">
        <div className="avatar-section">
          <img src={avatarUrl} alt={jugador.nombre} className="avatar-img" />
          <div>
            <p className="player-name">{jugador.nombre}</p>
            <p className="player-level">Nivel {jugador.nivel}</p>
          </div>
        </div>
        <div className="money-section">
          <div className="money-amount">💰 {jugador.oro}</div>
          <div className="money-amount">⚡ {jugador.energia}</div>
        </div>
      </header>

      <div className="nav-tabs">
        <button className={`nav-tab-button ${vista === 'club' ? 'active' : ''}`} onClick={() => setVista('club')}>
          MI CLUB
        </button>
        <button className={`nav-tab-button ${vista === 'ranking' ? 'active' : ''}`} onClick={() => setVista('ranking')}>
          RANKING
        </button>
      </div>

      <div className="main-content">
        {vista === 'club' && (
          <GamePage
            jugador={jugador}
            fuerzaTotal={fuerzaTotal}
            mensaje={mensaje}
            battleLog={battleLog}
            acciones={acciones}
          />
        )}

        {vista === 'ranking' && (
          <div className="ranking-container game-content-area">
            <div className="ranking-title">Ranking</div>
            {!botsGenerados && (
              <button className="btn btn-purple" onClick={generarBots} disabled={cargando}>
                Generar bots
              </button>
            )}
            <div className="ranking-list">
              {ranking.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`ranking-item ${entry.esJugador ? 'player-highlight' : ''}`}
                >
                  <div className="ranking-position">#{idx + 1}</div>
                  <div className="ranking-name">{entry.nombre}</div>
                  <div className="ranking-force">{entry.fuerzaTotal}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
