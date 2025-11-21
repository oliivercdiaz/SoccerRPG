import { ItemCard } from '../components/ItemCard';
import type { BattleLog, Jugador } from '../types';

interface GamePageProps {
  jugador: Jugador;
  fuerzaTotal: number;
  mensaje: string;
  battleLog: BattleLog;
  acciones: {
    entrenar: () => void;
    descansar: () => void;
    cofre: () => void;
    vender: (id: number) => void;
    equipar: (id: number) => void;
    combatir: () => void;
    boss: () => void;
    ranking: () => void;
  };
}

export const GamePage = ({ jugador, fuerzaTotal, mensaje, battleLog, acciones }: GamePageProps) => {
  const energiaPct = Math.min(100, Math.max(0, jugador.energia));
  const experiencia = jugador.experiencia ?? 0;
  const xpPct = Math.min(100, Math.max(0, experiencia % 100));

  const equipados = jugador.inventario.filter((item) => item.estaEquipado);
  const mochila = jugador.inventario.filter((item) => !item.estaEquipado);

  return (
    <div className="game-content-area">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">FUERZA TOTAL</div>
          <div className="stat-value val-red">{fuerzaTotal}</div>
          <div className="stat-label">Base: {jugador.fuerza}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ENERGÍA</div>
          <div className="stat-value val-blue">{jugador.energia}/100</div>
          <div className="progress-bg">
            <div className="progress-fill" style={{ width: `${energiaPct}%` }}></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">EXPERIENCIA</div>
          <div className="stat-value">{experiencia} XP</div>
          <div className="progress-bg">
            <div className="progress-fill xp" style={{ width: `${xpPct}%` }}></div>
          </div>
        </div>
      </div>

      <div className="actions-grid">
        <button className="btn" onClick={acciones.entrenar} disabled={jugador.energia < 5}>
          🏋️ Entrenar
        </button>
        <button className="btn btn-blue" onClick={acciones.descansar}>
          💤 Descansar
        </button>
        <button className="btn btn-gold" onClick={acciones.cofre}>
          🗝️ Abrir Cofre
        </button>
      </div>

      <div className="combat-grid">
        <button className="btn btn-purple btn-big" onClick={acciones.combatir} disabled={jugador.energia < 20}>
          🏆 Jugar Liga (-20⚡)
        </button>
        <button className="btn btn-danger btn-big" onClick={acciones.boss} disabled={jugador.energia < 50}>
          🐉 Mazmorra (-50⚡)
        </button>
      </div>

      <div className="message-toast">{mensaje}</div>

      <div
        className={`battle-log ${
          battleLog.resultado === 'Victoria' ? 'log-win' : battleLog.resultado === 'Derrota' ? 'log-lose' : ''
        }`}
      >
        <div className="log-title">Registro de combate</div>
        {battleLog.log.length === 0 && <div className="log-line">Sin eventos aún.</div>}
        {battleLog.log.map((linea, idx) => (
          <div key={idx} className="log-line">
            {linea}
          </div>
        ))}
      </div>

      <div className="inventory-section">
        <div className="inventory-title">🛡️ EQUIPADO</div>
        <div className="inventory-grid">
          {equipados.length === 0 && <div className="stat-label">No hay objetos equipados.</div>}
          {equipados.map((item) => (
            <ItemCard key={item.id} item={item} onEquipar={acciones.equipar} isEquipped onVender={acciones.vender} />
          ))}
        </div>

        <div className="inventory-title">🎒 MOCHILA</div>
        <div className="inventory-grid">
          {mochila.length === 0 && <div className="stat-label">Tu mochila está vacía.</div>}
          {mochila.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEquipar={acciones.equipar}
              onVender={acciones.vender}
              isEquipped={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
