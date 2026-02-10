import { getDatabase } from "../database/connection.js";
import type {
  ProducerInterval,
  PrizeIntervalResponse,
  ProducerWins,
} from "../types/index.js";

export class PrizeIntervalService {
  private parseProducers(producersString: string): string[] {
    return producersString
      .split(/,| and /i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  private getProducerWins(): ProducerWins {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM movies WHERE winner = 1 ORDER BY year ASC")
      .all() as Array<{ producers: string; year: number }>;

    const producerWins: ProducerWins = {};

    for (const movie of rows) {
      const producers = this.parseProducers(movie.producers);
      for (const producer of producers) {
        if (!producerWins[producer]) {
          producerWins[producer] = [];
        }
        producerWins[producer].push(movie.year);
      }
    }

    for (const producer of Object.keys(producerWins)) {
      producerWins[producer].sort((a, b) => a - b);
    }

    return producerWins;
  }

  private calculateAllIntervals(): ProducerInterval[] {
    const producerWins = this.getProducerWins();
    const intervals: ProducerInterval[] = [];

    for (const [producer, years] of Object.entries(producerWins)) {
      if (years.length < 2) continue;

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

  getPrizeIntervals(): PrizeIntervalResponse {
    const allIntervals = this.calculateAllIntervals();

    if (allIntervals.length === 0) {
      return { min: [], max: [] };
    }

    let minInterval = Infinity;
    let maxInterval = -Infinity;

    for (const interval of allIntervals) {
      if (interval.interval < minInterval) minInterval = interval.interval;
      if (interval.interval > maxInterval) maxInterval = interval.interval;
    }

    return {
      min: allIntervals.filter((i) => i.interval === minInterval),
      max: allIntervals.filter((i) => i.interval === maxInterval),
    };
  }
}

export const prizeIntervalService = new PrizeIntervalService();
