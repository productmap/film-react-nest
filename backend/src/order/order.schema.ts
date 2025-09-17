import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ required: true })
  scheduleId: string;

  @Prop({ required: true })
  seat: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
