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

export const ItemCard = ({ item, onEquipar, onDesequipar, onVender }: Props) => {
  const icon = iconMap[item.tipo] ?? iconMap.Espada;

  return (
    <div className={`item-card rarity-${item.rareza}`}>
      <div className="item-card__left">
        <div className="item-avatar">
          <img src={icon} alt={item.nombre} />
        </div>
        <div className="item-info">
          <div className="item-title">{item.nombre}</div>
          <div className="item-meta">
            {item.tipo} • Poder +{item.poder} • {item.rareza.toUpperCase()}
          </div>
          {item.estaEquipado && <span className="pill equipped">Equipado</span>}
        </div>
      </div>
      <div className="item-actions">
        {!item.estaEquipado && (
          <button className="btn ghost" onClick={() => onEquipar(item.id)}>
            ⬆️ Equipar
          </button>
        )}
        {item.estaEquipado && (
          <button className="btn warning" onClick={() => onDesequipar(item.id)}>
            ⬇️ Desequipar
          </button>
        )}
        <button className="btn danger" onClick={() => onVender(item.id)}>
          💰 Vender
        </button>
      </div>
    </div>
  );
};
