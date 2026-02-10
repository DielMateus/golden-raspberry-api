import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import {
  resetDatabase,
  createTables,
  loadCSVFromString,
} from "../src/database/index.js";
import { prizeIntervalService } from "../src/services/prizeIntervalService.js";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeEach(async () => {
  resetDatabase();
  createTables();
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  resetDatabase();
});

describe("Prize Interval Service - Controlled Data", () => {
  it("should return empty arrays when no winners exist", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;
1981;Movie B;Studio B;Producer B;`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();
    expect(result).toEqual({ min: [], max: [] });
  });

  it("should return empty arrays when no producer has multiple wins", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1981;Movie B;Studio B;Producer B;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();
    expect(result).toEqual({ min: [], max: [] });
  });

  it("should calculate correct interval for a single producer with two wins", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1985;Movie B;Studio B;Producer A;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min).toHaveLength(1);
    expect(result.max).toHaveLength(1);
    expect(result.min[0]).toEqual({
      producer: "Producer A",
      interval: 5,
      previousWin: 1980,
      followingWin: 1985,
    });
    expect(result.max[0]).toEqual(result.min[0]);
  });

  it("should correctly identify min and max when multiple producers have different intervals", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1981;Movie B;Studio B;Producer A;yes
1990;Movie C;Studio C;Producer B;yes
2000;Movie D;Studio D;Producer B;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min[0].producer).toBe("Producer A");
    expect(result.min[0].interval).toBe(1);
    expect(result.max[0].producer).toBe("Producer B");
    expect(result.max[0].interval).toBe(10);
  });

  it("should return multiple entries in min when there is a tie", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1981;Movie B;Studio B;Producer A;yes
1990;Movie C;Studio C;Producer B;yes
1991;Movie D;Studio D;Producer B;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min).toHaveLength(2);
    expect(result.min[0].interval).toBe(1);
    expect(result.min[1].interval).toBe(1);
  });

  it("should correctly parse producers separated by 'and'", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A and Producer B;yes
1985;Movie B;Studio B;Producer A;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min[0].producer).toBe("Producer A");
    expect(result.min[0].interval).toBe(5);
  });

  it("should correctly parse producers separated by comma", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A, Producer B;yes
1990;Movie B;Studio B;Producer B;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min[0].producer).toBe("Producer B");
    expect(result.min[0].interval).toBe(10);
  });

  it("should handle a producer with three consecutive wins", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1985;Movie B;Studio B;Producer A;yes
2000;Movie C;Studio C;Producer A;yes`;

    loadCSVFromString(csv);

    const result = prizeIntervalService.getPrizeIntervals();

    expect(result.min[0].interval).toBe(5);
    expect(result.min[0].previousWin).toBe(1980);
    expect(result.min[0].followingWin).toBe(1985);
    expect(result.max[0].interval).toBe(15);
    expect(result.max[0].previousWin).toBe(1985);
    expect(result.max[0].followingWin).toBe(2000);
  });
});

describe("Prize Interval via API - Controlled Data", () => {
  it("should return correct JSON via API endpoint with controlled data", async () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer Fast;yes
1981;Movie B;Studio B;Producer Fast;yes
1990;Movie C;Studio C;Producer Slow;yes
2010;Movie D;Studio D;Producer Slow;yes`;

    loadCSVFromString(csv);

    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);

    expect(body.min).toEqual([
      {
        producer: "Producer Fast",
        interval: 1,
        previousWin: 1980,
        followingWin: 1981,
      },
    ]);

    expect(body.max).toEqual([
      {
        producer: "Producer Slow",
        interval: 20,
        previousWin: 1990,
        followingWin: 2010,
      },
    ]);
  });

  it("should return empty arrays via API when no data has intervals", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);
    expect(body).toEqual({ min: [], max: [] });
  });
});
