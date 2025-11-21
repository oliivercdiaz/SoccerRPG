import type { Item } from '../types';

interface Props {
  item: Item;
  onEquipar: (id: number) => void;
  onDesequipar: (id: number) => void;
  onVender: (id: number) => void;
}

const iconMap: Record<string, string> = {
  Botas: 'https://cdn.jsdelivr.net/gh/game-icons/icons@1.4.0/svg/boots.svg',
  Camiseta: 'https://cdn.jsdelivr.net/gh/game-icons/icons@1.4.0/svg/shoulder-armor.svg',
  Espada: 'https://cdn.jsdelivr.net/gh/game-icons/icons@1.4.0/svg/plain-dagger.svg',
  Guantes: 'https://cdn.jsdelivr.net/gh/game-icons/icons@1.4.0/svg/hand.svg',
};

const rarityColor: Record<string, string> = {
  comun: '#8b95a1',
  raro: '#4cc9f0',
  legendario: '#e9b949',
};

export const ItemCard = ({ item, onEquipar, onDesequipar, onVender }: Props) => {
  const icon = iconMap[item.tipo] ?? iconMap.Espada;

  return (
    <div
      style={{
        backgroundColor: '#0f3460',
        border: `2px solid ${rarityColor[item.rareza] ?? '#8b95a1'}`,
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <img
        src={icon}
        alt={item.nombre}
        style={{ width: '48px', height: '48px', filter: 'invert(90%)', objectFit: 'contain' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold' }}>{item.nombre}</div>
        <div style={{ color: '#b3b3b3', fontSize: '12px' }}>
          {item.tipo} • Poder +{item.poder} • {item.rareza.toUpperCase()}
        </div>
        {item.estaEquipado && <div style={{ color: '#4caf50', fontSize: '12px' }}>Equipado</div>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {!item.estaEquipado && (
          <button
            onClick={() => onEquipar(item.id)}
            style={{
              backgroundColor: '#4caf50',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            ⬆️ Equipar
          </button>
        )}
        {item.estaEquipado && (
          <button
            onClick={() => onDesequipar(item.id)}
            style={{
              backgroundColor: '#ff9800',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 8px',
              cursor: 'pointer',
            }}
          >
            ⬇️ Desequipar
          </button>
        )}
        <button
          onClick={() => onVender(item.id)}
          style={{
            backgroundColor: '#e94560',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 8px',
            cursor: 'pointer',
          }}
        >
          💰 Vender
        </button>
      </div>
    </div>
  );
};
