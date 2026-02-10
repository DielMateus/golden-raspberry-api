export interface Movie {
  id?: number;
  year: number;
  title: string;
  studios: string;
  producers: string;
  winner: boolean;
}

export interface MovieCSVRecord {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner: string;
}

export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

export interface PrizeIntervalResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

export interface ProducerWins {
  [producer: string]: number[];
}
