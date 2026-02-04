/**
 * Representa um filme no banco de dados
 */
export interface Movie {
  id?: number;
  year: number;
  title: string;
  studios: string;
  producers: string;
  winner: boolean;
}

/**
 * Representa um registro de filme parseado do CSV
 */
export interface MovieCSVRecord {
  year: string;
  title: string;
  studios: string;
  producers: string;
  winner: string;
}

/**
 * Representa um intervalo de prêmio de um produtor
 */
export interface ProducerInterval {
  producer: string;
  interval: number;
  previousWin: number;
  followingWin: number;
}

/**
 * Resposta do endpoint de intervalos de prêmios
 */
export interface PrizeIntervalResponse {
  min: ProducerInterval[];
  max: ProducerInterval[];
}

/**
 * Representa os anos de vitória agrupados por produtor
 */
export interface ProducerWins {
  [producer: string]: number[];
}
