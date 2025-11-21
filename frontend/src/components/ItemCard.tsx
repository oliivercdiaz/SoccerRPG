import type { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onEquipar: (id: number) => void;
  onVender?: (id: number) => void;
  isEquipped: boolean;
}

const rarityClass = (rareza: string) => {
  const normalized = rareza.toLowerCase();
  if (normalized.includes('legend')) return 'rare-legendary';
  if (normalized.includes('unique') || normalized.includes('épico')) return 'rare-unique';
  if (normalized.includes('rare') || normalized.includes('raro')) return 'rare-rare';
  return 'rare-common';
};

export const ItemCard = ({ item, onEquipar, onVender, isEquipped }: ItemCardProps) => {
  return (
    <div className={`item-card ${rarityClass(item.rareza)}`}>
      <div className="item-icon">
        <img
          src={`https://raw.githubusercontent.com/ncform/ncform.github.io/master/img/item-${item.tipo.toLowerCase()}.png`}
          alt={item.nombre}
          className="item-img"
        />
      </div>
      <div className="item-name">{item.nombre}</div>
      <div className="item-stats">+{item.bonusFuerza} fuerza</div>
      <div className="actions-grid">
        {!isEquipped && onVender && (
          <button className="btn btn-gold" onClick={() => onVender(item.id)}>
            $ Vender
          </button>
        )}
        <button className="btn btn-blue" onClick={() => onEquipar(item.id)}>
          {isEquipped ? '⬇️ Desequipar' : '⬆️ Equipar'}
        </button>
      </div>
    </div>
  );
};
