import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { RankingPage } from './components/RankingPage';
import { GamePage } from './pages/GamePage';
import { JuegoService } from './services/api';
import type { BattleLog, Jugador, RankingEntry, ServerResponse } from './types';

const calcularFuerzaTotal = (jugador: Jugador) =>
  jugador.fuerza + jugador.inventario.filter((i) => i.estaEquipado).reduce((sum, item) => sum + item.bonusFuerza, 0);

function App() {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [fuerzaTotal, setFuerzaTotal] = useState(0);
  const [mensaje, setMensaje] = useState('Cargando vestuario...');
  const [battleLog, setBattleLog] = useState<BattleLog>({ log: [], resultado: '' });
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [botsGenerados, setBotsGenerados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<'club' | 'ranking'>('club');

  const avatarUrl = useMemo(
    () => `https://robohash.org/${jugador?.nombre ?? 'club'}.png?set=set2`,
    [jugador?.nombre],
  );

  const refrescarFuerza = (estado: Jugador) => {
    setJugador(estado);
    setFuerzaTotal(calcularFuerzaTotal(estado));
  };

  const actualizarDesdeRespuesta = async (respuesta: ServerResponse<any>) => {
    refrescarFuerza(respuesta.estado);
    setMensaje(respuesta.mensaje);
  };

  const cargarRanking = async (estado?: Jugador) => {
    const data = await JuegoService.getRanking(estado ?? jugador ?? undefined);
    setRanking(data);
  };

  const cargarEstadoInicial = async () => {
    setCargando(true);
    try {
      const data = await JuegoService.getProfile();
      await actualizarDesdeRespuesta(data);
      await cargarRanking(data.estado);
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
      await cargarRanking(respuesta.estado);
    } catch (error) {
      setMensaje('❌ Error conectando con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const acciones = {
    entrenar: () =>
      ejecutarAccion(() => JuegoService.train(), (resp) => {
        setBattleLog({ log: resp.log ?? [resp.mensaje], resultado: resp.resultado ?? '' });
      }),
    descansar: () =>
      ejecutarAccion(() => JuegoService.rest(), (resp) => {
        setBattleLog({ log: resp.log ?? [resp.mensaje], resultado: resp.resultado ?? '' });
      }),
    cofre: () =>
      ejecutarAccion(() => JuegoService.openChest(), (resp) => {
        const lineas = resp.log ?? [resp.mensaje];
        const loot = resp.extra?.item;
        if (loot) lineas.push(`Nuevo: ${loot.nombre}`);
        setBattleLog({ log: lineas, resultado: resp.resultado ?? '' });
      }),
    vender: (id: number) =>
      ejecutarAccion(() => JuegoService.sellItem(id), (resp) => {
        setBattleLog({ log: resp.log ?? [resp.mensaje], resultado: resp.resultado ?? '' });
      }),
    equipar: (id: number) => {
      const actual = jugador?.inventario.find((i) => i.id === id);
      const equipar = actual ? !actual.estaEquipado : true;
      return ejecutarAccion(() => JuegoService.equipItem(id, equipar), (resp) => {
        setBattleLog({ log: resp.log ?? [resp.mensaje], resultado: resp.resultado ?? '' });
      });
    },
    combatir: () =>
      ejecutarAccion(() => JuegoService.playLeague(), (resp) => {
        setBattleLog({ log: resp.log ?? [resp.mensaje], resultado: resp.resultado ?? '' });
      }),
    boss: () =>
      ejecutarAccion(() => JuegoService.playDungeon(), (resp) => {
        const lineas = resp.log ?? [resp.mensaje];
        if (resp.extra?.botin) lineas.push(`Botín: ${resp.extra.botin.nombre}`);
        setBattleLog({ log: lineas, resultado: resp.resultado ?? '' });
      }),
    ranking: () => setVista('ranking'),
  };

  const generarBots = async () => {
    setCargando(true);
    try {
      const data = await JuegoService.generateBots(jugador ?? undefined);
      setRanking(data);
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
          <RankingPage
            ranking={ranking}
            jugador={jugador}
            botsGenerados={botsGenerados}
            cargando={cargando}
            onGenerateBots={generarBots}
          />
        )}
      </div>
    </div>
  );
}

export default App;
