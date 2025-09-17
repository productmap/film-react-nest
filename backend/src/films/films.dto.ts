export class MovieDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  // releaseYear: number; // Поле удалено
  duration: number;
  genre: string;
  schedule?: SessionDto[];
}

export class SessionDto {
  id: string;
  daytime: string;
  hall: number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}
