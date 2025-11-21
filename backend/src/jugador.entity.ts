import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Jugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: 10 })
  fuerzaBase: number;

  @Column({ default: 100 })
  energia: number;

  @Column({ default: 0 })
  experiencia: number;

  @Column({ default: 1 })
  nivel: number;

  @Column({ default: 0 })
  oro: number;

  @Column({ default: 0 })
  cofres_abiertos_desde_legendario: number;

  @Column({ default: 0 })
  entrenos_hoy: number;

  @Column({ default: '' })
  entrenos_fecha: string;

  @Column({ default: '' })
  ultima_mision: string;

  @OneToMany(() => Item, (item) => item.jugador, { cascade: true })
  items: Item[];
}
