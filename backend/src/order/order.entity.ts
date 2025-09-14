import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Film } from '../films/films.entity';

// Сущность, описывающая сеанс в кинотеатре.
@Entity()
export class Schedule {
  @PrimaryColumn('uuid')
  id: string;

  @Column('timestamp with time zone')
  daytime: Date;

  @Column('int')
  hall: number;

  @Column('int')
  rows: number;

  @Column('int')
  seats: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { array: true, nullable: true })
  taken: string[];

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Film, (film) => film.schedules)
  @JoinColumn({ name: 'film_id' })
  film: Film;
}
