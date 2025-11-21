import { useEffect, useState } from 'react';
import './App.css';
import { GamePage } from './pages/GamePage';
import { JuegoService } from './services/api';
import type { Jugador, RankingEntry, ServerResponse } from './types';

function App() {
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [fuerzaTotal, setFuerzaTotal] = useState(0);
  const [mensaje, setMensaje] = useState('Cargando vestuario...');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [botsGenerados, setBotsGenerados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<'club' | 'ranking'>('club');
  const [layout, setLayout] = useState<'web' | 'steam' | 'compact'>('web');

  const actualizarDesdeRespuesta = async (respuesta: ServerResponse) => {
    setJugador(respuesta.estado);
    setFuerzaTotal(respuesta.fuerzaTotal ?? respuesta.estado.fuerzaBase);
    setMensaje(respuesta.mensaje);
    const rankingData = await JuegoService.obtenerRanking(respuesta.estado);
    setRanking(rankingData);
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

  if (!jugador) return <div className="loading">Cargando vestuario...</div>;

  return (
    <GamePage
      jugador={jugador}
      fuerzaTotal={fuerzaTotal}
      mensaje={mensaje}
      ranking={ranking}
      botsGenerados={botsGenerados}
      cargando={cargando}
      vista={vista}
      layout={layout}
      onVistaChange={setVista}
      onLayoutChange={setLayout}
      onResponse={actualizarDesdeRespuesta}
      onRankingChange={setRanking}
      onBotsGenerados={() => setBotsGenerados(true)}
      setCargando={setCargando}
      onErrorMessage={setMensaje}
    />
  );
}

export default App;
