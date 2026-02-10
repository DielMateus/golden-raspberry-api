import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../src/app.js";
import { loadCSVData, resetDatabase } from "../src/database/index.js";
import { FastifyInstance } from "fastify";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app: FastifyInstance;

beforeAll(async () => {
  const csvPath = path.resolve(__dirname, "../data/movielist.csv");
  loadCSVData(csvPath);
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  resetDatabase();
});

describe("GET /producers/awards-interval", () => {
  it("should return 200 with min and max arrays", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body).toHaveProperty("min");
    expect(body).toHaveProperty("max");
    expect(Array.isArray(body.min)).toBe(true);
    expect(Array.isArray(body.max)).toBe(true);
  });

  it("should return correct structure for each interval entry", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    for (const entry of [...body.min, ...body.max]) {
      expect(entry).toHaveProperty("producer");
      expect(entry).toHaveProperty("interval");
      expect(entry).toHaveProperty("previousWin");
      expect(entry).toHaveProperty("followingWin");
      expect(typeof entry.producer).toBe("string");
      expect(typeof entry.interval).toBe("number");
      expect(typeof entry.previousWin).toBe("number");
      expect(typeof entry.followingWin).toBe("number");
    }
  });

  it("should have interval equal to followingWin minus previousWin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    for (const entry of [...body.min, ...body.max]) {
      expect(entry.interval).toBe(entry.followingWin - entry.previousWin);
    }
  });

  it("should return Joel Silver as the producer with the shortest interval of 1 year", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    expect(body.min.length).toBeGreaterThanOrEqual(1);

    const minInterval = body.min[0].interval;
    expect(minInterval).toBe(1);

    const joelSilver = body.min.find(
      (entry: { producer: string }) => entry.producer === "Joel Silver",
    );
    expect(joelSilver).toBeDefined();
    expect(joelSilver.previousWin).toBe(1990);
    expect(joelSilver.followingWin).toBe(1991);
    expect(joelSilver.interval).toBe(1);
  });

  it("should return Matthew Vaughn as the producer with the longest interval of 13 years", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    expect(body.max.length).toBeGreaterThanOrEqual(1);

    const maxInterval = body.max[0].interval;
    expect(maxInterval).toBe(13);

    const vaughn = body.max.find(
      (entry: { producer: string }) => entry.producer === "Matthew Vaughn",
    );
    expect(vaughn).toBeDefined();
    expect(vaughn.previousWin).toBe(2002);
    expect(vaughn.followingWin).toBe(2015);
    expect(vaughn.interval).toBe(13);
  });

  it("should have all min entries with the same minimum interval value", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);
    const minValue = body.min[0].interval;

    for (const entry of body.min) {
      expect(entry.interval).toBe(minValue);
    }
  });

  it("should have all max entries with the same maximum interval value", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);
    const maxValue = body.max[0].interval;

    for (const entry of body.max) {
      expect(entry.interval).toBe(maxValue);
    }
  });

  it("should have min interval strictly less than max interval", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    expect(body.min[0].interval).toBeLessThan(body.max[0].interval);
  });

  it("should validate exact min results from the original CSV data", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    expect(body.min).toEqual(
      expect.arrayContaining([
        {
          producer: "Joel Silver",
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ]),
    );
  });

  it("should validate exact max results from the original CSV data", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    expect(body.max).toEqual(
      expect.arrayContaining([
        {
          producer: "Matthew Vaughn",
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ]),
    );
  });

  it("should only contain producers with multiple wins in the results", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    const body = JSON.parse(response.body);

    for (const entry of [...body.min, ...body.max]) {
      expect(entry.interval).toBeGreaterThan(0);
      expect(entry.previousWin).toBeLessThan(entry.followingWin);
    }
  });
});

describe("GET /health", () => {
  it("should return 200 with status ok", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
    expect(body).toHaveProperty("timestamp");
  });
});

describe("Non-existent routes", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/non-existent",
    });

    expect(response.statusCode).toBe(404);
  });
});
