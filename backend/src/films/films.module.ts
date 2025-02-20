import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmsRepository } from './films.repository';
import { Film, FilmSchema } from './films.schema';
import * as path from 'path';
import * as fs from 'fs/promises';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  controllers: [FilmsController],
  providers: [FilmsService, FilmsRepository],
  exports: [FilmsService],
})
export class FilmsModule implements OnModuleInit {
  constructor(private readonly filmsService: FilmsService) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  async seedDatabase() {
    const filmsCount = await this.filmsService.countFilms();
    if (filmsCount === 0) {
      const stubFilePath = path.join(
        __dirname,
        '..',
        '..',
        'test',
        'mongodb_initial_stub.json',
      );
      try {
        const jsonData = await fs.readFile(stubFilePath, 'utf-8');
        const filmsData = JSON.parse(jsonData);
        await this.filmsService.importFilms(filmsData);
        console.log('Database seeded with initial films data.');
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    } else {
      console.log('Database already seeded, skipping seeding.');
    }
  }
}
