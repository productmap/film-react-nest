import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from '../films/films.schema';

@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  async updateTakenSeats(
    filmId: string,
    scheduleId: string,
    bookedSeats: string[],
    takenSeatsBeforeBooking: string[],
  ): Promise<void> {
    const updatedTakenSeats = [...takenSeatsBeforeBooking, ...bookedSeats];

    await this.filmModel
      .updateOne(
        { id: filmId, 'schedule.id': scheduleId },
        { $set: { 'schedule.$.taken': updatedTakenSeats } },
      )
      .exec();
  }
}
