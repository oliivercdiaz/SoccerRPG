import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Jugador } from './jugador.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  tipo: string;

  @Column({ default: 0 })
  poder: number;

  @Column({ default: 0 })
  valor: number;

  @Column({ default: 'comun' })
  rareza: string;

  @Column({ default: false })
  estaEquipado: boolean;

  @ManyToOne(() => Jugador, (jugador) => jugador.items, { onDelete: 'CASCADE' })
  jugador: Jugador;
}
