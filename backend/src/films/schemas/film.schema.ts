import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Schedule } from './schedule.schema';

export type FilmDocument = HydratedDocument<Film>;

@Schema({ timestamps: true, versionKey: false, collection: 'films' })
export class Film {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  director: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  cover: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  about: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ type: Object, ref: 'Schedule' }], default: [] })
  schedule: Schedule[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);
