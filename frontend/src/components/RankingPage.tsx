import type { Jugador, RankingEntry } from '../types';

interface RankingPageProps {
  ranking: RankingEntry[];
  jugador?: Jugador;
  onGenerateBots: () => void;
  botsGenerados: boolean;
  cargando: boolean;
}

export const RankingPage = ({ ranking, jugador, onGenerateBots, botsGenerados, cargando }: RankingPageProps) => {
  return (
    <div className="ranking-container game-content-area">
      <div className="ranking-title">Ranking</div>
      {!botsGenerados && (
        <button className="btn btn-purple" onClick={onGenerateBots} disabled={cargando}>
          Generar bots
        </button>
      )}
      <div className="ranking-list">
        {ranking.map((entry, idx) => (
          <div
            key={entry.id}
            className={`ranking-item ${entry.esJugador || entry.nombre === jugador?.nombre ? 'player-highlight' : ''}`}
          >
            <div className="ranking-position">#{idx + 1}</div>
            <div className="ranking-name">{entry.nombre}</div>
            <div className="ranking-force">{entry.fuerzaTotal ?? entry.fuerza}</div>
          </div>
        ))}
        {ranking.length === 0 && <div className="stat-label">No hay jugadores en el ranking.</div>}
      </div>
    </div>
  );
};
