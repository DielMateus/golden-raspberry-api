import { movieService } from "./movieService.js";
import type {
  ProducerInterval,
  PrizeIntervalResponse,
  ProducerWins,
} from "../types/index.js";

/**
 * Serviço para calcular intervalos de prêmios dos produtores
 */
export class PrizeIntervalService {
  /**
   * Separa os produtores de uma string
   * Os produtores podem estar separados por ", " ou " and "
   * @param producersString - String com os nomes dos produtores
   * @returns Array com os nomes dos produtores individuais
   */
  // private parseProducers(producersString: string): string[] {
  //   // Primeiro, substitui " and " por vírgula para normalizar
  //   const normalized = producersString.replace(/\s+and\s+/gi, ", ");

  //   // Divide por vírgula e limpa espaços
  //   return normalized
  //     .split(",")
  //     .map((p) => p.trim())
  //     .filter((p) => p.length > 0);
  // }

  private parseProducers(producersString: string): string[] {
    return producersString
      .split(/,| and /i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  /**
   * Agrupa os anos de vitória por produtor
   * @returns Objeto com produtores como chaves e arrays de anos como valores
   */
  private getProducerWins(): ProducerWins {
    const winners = movieService.getWinners();
    const producerWins: ProducerWins = {};

    for (const movie of winners) {
      const producers = this.parseProducers(movie.producers);

      for (const producer of producers) {
        if (!producerWins[producer]) {
          producerWins[producer] = [];
        }
        producerWins[producer].push(movie.year);
      }
    }

    // Ordena os anos para cada produtor
    for (const producer of Object.keys(producerWins)) {
      producerWins[producer].sort((a, b) => a - b);
    }

    return producerWins;
  }

  /**
   * Calcula todos os intervalos entre vitórias consecutivas
   * @returns Array com todos os intervalos de todos os produtores
   */
  private calculateAllIntervals(): ProducerInterval[] {
    const producerWins = this.getProducerWins();
    const intervals: ProducerInterval[] = [];

    for (const [producer, years] of Object.entries(producerWins)) {
      // Só considera produtores com mais de uma vitória
      if (years.length < 2) continue;

      // Calcula intervalos entre vitórias consecutivas
      for (let i = 1; i < years.length; i++) {
        intervals.push({
          producer,
          interval: years[i] - years[i - 1],
          previousWin: years[i - 1],
          followingWin: years[i],
        });
      }
    }

    return intervals;
  }

  /**
   * Obtém os produtores com maior e menor intervalo entre prêmios
   * @returns Objeto com arrays min e max contendo os intervalos
   */
  getPrizeIntervals(): PrizeIntervalResponse {
    const allIntervals = this.calculateAllIntervals();

    if (allIntervals.length === 0) {
      return { min: [], max: [] };
    }

    // Encontra o menor e maior intervalo
    let minInterval = Infinity;
    let maxInterval = -Infinity;

    for (const interval of allIntervals) {
      if (interval.interval < minInterval) {
        minInterval = interval.interval;
      }
      if (interval.interval > maxInterval) {
        maxInterval = interval.interval;
      }
    }

    // Filtra todos os produtores com o menor intervalo
    const minIntervals = allIntervals.filter((i) => i.interval === minInterval);

    // Filtra todos os produtores com o maior intervalo
    const maxIntervals = allIntervals.filter((i) => i.interval === maxInterval);

    return {
      min: minIntervals,
      max: maxIntervals,
    };
  }
}

// Exporta uma instância singleton do serviço
export const prizeIntervalService = new PrizeIntervalService();
