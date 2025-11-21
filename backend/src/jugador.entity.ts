import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Jugador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: 10 })
  fuerza: number;

  @Column({ default: 100 })
  energia: number;

  @Column({ default: 0 })
  experiencia: number; // ¡Añadimos XP para subir de nivel futuro!
  
  @Column({ default: 1 })
  nivel: number;
}