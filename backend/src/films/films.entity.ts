import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Schedule } from '../order/order.entity';

// Сущность, описывающая фильм.
@Entity()
export class Film {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  about: string;

  @Column('text')
  description: string;

  // Поле удалено, так как его нет в исходных данных и на фронтенде.
  // @Column({ name: 'release_year' })
  // releaseYear: number;

  @Column('text')
  genre: string;

  @Column('int')
  duration: number;

  @Column('decimal', { precision: 3, scale: 1, nullable: true })
  rating: number;

  @Column({ nullable: true })
  director: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  cover: string;

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

  // Связь "один-ко-многим" с сеансами.
  @OneToMany(() => Schedule, (schedule) => schedule.film, {
    cascade: true,
  })
  schedules: Schedule[];
}
