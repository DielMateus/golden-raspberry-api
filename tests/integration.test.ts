import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../src/app.js";
import {
  loadCSVFromString,
  resetDatabase,
  createTables,
  dropTables,
} from "../src/database/index.js";
import { FastifyInstance } from "fastify";

/**
 * Dados de teste do CSV original
 * Contém uma amostra dos dados reais para validar o algoritmo
 */
const SAMPLE_CSV_DATA = `year;title;studios;producers;winner
1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes
1984;Where the Boys Are '84;TriStar Pictures;Allan Carr;
1990;Ghosts Can't Do It;Triumph Releasing;Bo Derek;yes
1984;Bolero;Cannon Films;Bo Derek;yes
1986;Under the Cherry Moon;Warner Bros.;Bob Cavallo, Joe Ruffalo and Steve Fargnoli;yes
1990;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;yes
1991;Hudson Hawk;TriStar Pictures;Joel Silver;yes
2017;The Emoji Movie;Columbia Pictures;Michelle Raimo Kouyate;yes`;

/**
 * Dados de teste para validar múltiplos produtores com mesmo intervalo
 */
const TEST_CSV_MULTIPLE_INTERVALS = `year;title;studios;producers;winner
2000;Movie A;Studio A;Producer A;yes
2001;Movie B;Studio B;Producer A;yes
2010;Movie C;Studio C;Producer B;yes
2011;Movie D;Studio D;Producer B;yes
1990;Movie E;Studio E;Producer C;yes
2000;Movie F;Studio F;Producer C;yes`;

/**
 * Dados de teste para validar o formato exato da resposta
 */
const TEST_CSV_EXACT_FORMAT = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer X;yes
1981;Movie 2;Studio 2;Producer X;yes
1990;Movie 3;Studio 3;Producer Y;yes
2010;Movie 4;Studio 4;Producer Y;yes`;

let app: FastifyInstance;

describe("Golden Raspberry Awards API - Integration Tests", () => {
  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    resetDatabase();
  });

  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ok");
      expect(body.timestamp).toBeDefined();
    });
  });

  describe("API Root", () => {
    it("should return API information", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe("Golden Raspberry Awards API");
      expect(body.version).toBe("1.0.0");
      expect(body.endpoints).toBeDefined();
    });
  });
});

describe("Prize Intervals Endpoint - Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    resetDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    createTables();
  });

  describe("GET /producers/awards-interval", () => {
    it("should return correct format with min and max arrays", async () => {
      loadCSVFromString(SAMPLE_CSV_DATA);

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

    it("should return correct interval structure", async () => {
      loadCSVFromString(SAMPLE_CSV_DATA);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Verifica estrutura dos itens min
      if (body.min.length > 0) {
        const minItem = body.min[0];
        expect(minItem).toHaveProperty("producer");
        expect(minItem).toHaveProperty("interval");
        expect(minItem).toHaveProperty("previousWin");
        expect(minItem).toHaveProperty("followingWin");
        expect(typeof minItem.producer).toBe("string");
        expect(typeof minItem.interval).toBe("number");
        expect(typeof minItem.previousWin).toBe("number");
        expect(typeof minItem.followingWin).toBe("number");
      }

      // Verifica estrutura dos itens max
      if (body.max.length > 0) {
        const maxItem = body.max[0];
        expect(maxItem).toHaveProperty("producer");
        expect(maxItem).toHaveProperty("interval");
        expect(maxItem).toHaveProperty("previousWin");
        expect(maxItem).toHaveProperty("followingWin");
      }
    });

    it("should calculate correct minimum interval", async () => {
      loadCSVFromString(TEST_CSV_EXACT_FORMAT);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Producer X tem intervalo de 1 ano (1980-1981)
      expect(body.min.length).toBeGreaterThan(0);
      const minInterval = body.min[0];
      expect(minInterval.producer).toBe("Producer X");
      expect(minInterval.interval).toBe(1);
      expect(minInterval.previousWin).toBe(1980);
      expect(minInterval.followingWin).toBe(1981);
    });

    it("should calculate correct maximum interval", async () => {
      loadCSVFromString(TEST_CSV_EXACT_FORMAT);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Producer Y tem intervalo de 20 anos (1990-2010)
      expect(body.max.length).toBeGreaterThan(0);
      const maxInterval = body.max[0];
      expect(maxInterval.producer).toBe("Producer Y");
      expect(maxInterval.interval).toBe(20);
      expect(maxInterval.previousWin).toBe(1990);
      expect(maxInterval.followingWin).toBe(2010);
    });

    it("should return multiple producers with same minimum interval", async () => {
      loadCSVFromString(TEST_CSV_MULTIPLE_INTERVALS);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Producer A e Producer B têm intervalo de 1 ano
      expect(body.min.length).toBe(2);
      const producers = body.min.map(
        (item: { producer: string }) => item.producer,
      );
      expect(producers).toContain("Producer A");
      expect(producers).toContain("Producer B");

      // Todos devem ter intervalo 1
      body.min.forEach((item: { interval: number }) => {
        expect(item.interval).toBe(1);
      });
    });

    it("should return empty arrays when no producers have multiple wins", async () => {
      const csvNoMultipleWins = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer A;yes
1990;Movie 2;Studio 2;Producer B;yes
2000;Movie 3;Studio 3;Producer C;yes`;

      loadCSVFromString(csvNoMultipleWins);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      expect(body.min).toEqual([]);
      expect(body.max).toEqual([]);
    });

    it('should correctly parse producers separated by "and"', async () => {
      const csvWithAnd = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer A and Producer B;yes
1990;Movie 2;Studio 2;Producer A;yes`;

      loadCSVFromString(csvWithAnd);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Producer A deve ter intervalo de 10 anos
      expect(body.min.length).toBeGreaterThan(0);
      const producerA = body.min.find(
        (item: { producer: string }) => item.producer === "Producer A",
      );
      expect(producerA).toBeDefined();
      expect(producerA.interval).toBe(10);
    });

    it("should correctly parse producers separated by comma", async () => {
      const csvWithComma = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer A, Producer B;yes
1985;Movie 2;Studio 2;Producer A;yes`;

      loadCSVFromString(csvWithComma);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      expect(body.min.length).toBeGreaterThan(0);
      const producerA = body.min.find(
        (item: { producer: string }) => item.producer === "Producer A",
      );
      expect(producerA).toBeDefined();
      expect(producerA.interval).toBe(5);
    });

    it("should handle producer with more than two wins", async () => {
      const csvMultipleWins = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer A;yes
1985;Movie 2;Studio 2;Producer A;yes
2000;Movie 3;Studio 3;Producer A;yes`;

      loadCSVFromString(csvMultipleWins);

      const response = await app.inject({
        method: "GET",
        url: "/producers/awards-interval",
      });

      const body = JSON.parse(response.body);

      // Producer A tem dois intervalos: 5 anos (1980-1985) e 15 anos (1985-2000)
      // Min deve ser 5, Max deve ser 15
      expect(body.min[0].interval).toBe(5);
      expect(body.max[0].interval).toBe(15);
    });
  });
});

describe("Movies CRUD Endpoint - Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    resetDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    createTables();
    loadCSVFromString(SAMPLE_CSV_DATA);
  });

  describe("GET /movies", () => {
    it("should return all movies", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it("should filter movies by year", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies?year=1990",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      body.forEach((movie: { year: number }) => {
        expect(movie.year).toBe(1990);
      });
    });

    it("should filter only winners", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies?winner=true",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      body.forEach((movie: { winner: boolean }) => {
        expect(movie.winner).toBe(true);
      });
    });

    it("should return 400 for invalid year parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies?year=invalid",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /movies/:id", () => {
    it("should return a movie by ID", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies/1",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(1);
      expect(body).toHaveProperty("title");
      expect(body).toHaveProperty("year");
      expect(body).toHaveProperty("studios");
      expect(body).toHaveProperty("producers");
      expect(body).toHaveProperty("winner");
    });

    it("should return 404 for non-existent movie", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies/99999",
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 400 for invalid ID", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/movies/invalid",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /movies", () => {
    it("should create a new movie", async () => {
      const newMovie = {
        year: 2024,
        title: "Test Movie",
        studios: "Test Studio",
        producers: "Test Producer",
        winner: true,
      };

      const response = await app.inject({
        method: "POST",
        url: "/movies",
        payload: newMovie,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.title).toBe(newMovie.title);
      expect(body.year).toBe(newMovie.year);
      expect(body.winner).toBe(newMovie.winner);
    });

    it("should return 400 for missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/movies",
        payload: { title: "Incomplete Movie" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PUT /movies/:id", () => {
    it("should update a movie completely", async () => {
      const updatedMovie = {
        year: 2025,
        title: "Updated Movie",
        studios: "Updated Studio",
        producers: "Updated Producer",
        winner: false,
      };

      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: updatedMovie,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.title).toBe(updatedMovie.title);
      expect(body.year).toBe(updatedMovie.year);
    });

    it("should return 404 for non-existent movie", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/99999",
        payload: {
          year: 2025,
          title: "Test",
          studios: "Test",
          producers: "Test",
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe("PATCH /movies/:id", () => {
    it("should partially update a movie", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/1",
        payload: { title: "Partially Updated" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.title).toBe("Partially Updated");
    });
  });

  describe("DELETE /movies/:id", () => {
    it("should delete a movie", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/movies/1",
      });

      expect(response.statusCode).toBe(204);

      // Verifica se foi realmente deletado
      const getResponse = await app.inject({
        method: "GET",
        url: "/movies/1",
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 404 for non-existent movie", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/movies/99999",
      });

      expect(response.statusCode).toBe(404);
    });
  });
});

describe("Real CSV Data - Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    resetDatabase();
  });

  beforeEach(() => {
    resetDatabase();
    createTables();
  });

  it("should correctly process the original movielist.csv data", async () => {
    // Carrega dados similares ao CSV original
    const originalStyleCSV = `year;title;studios;producers;winner
1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes
1984;Bolero;Cannon Films;Bo Derek;yes
1990;Ghosts Can't Do It;Triumph Releasing;Bo Derek;yes
1986;Under the Cherry Moon;Warner Bros.;Bob Cavallo, Joe Ruffalo and Steve Fargnoli;yes
1990;The Adventures of Ford Fairlane;20th Century Fox;Steven Perry and Joel Silver;yes
1991;Hudson Hawk;TriStar Pictures;Joel Silver;yes
2017;The Emoji Movie;Columbia Pictures;Michelle Raimo Kouyate;yes`;

    loadCSVFromString(originalStyleCSV);

    const response = await app.inject({
      method: "GET",
      url: "/producers/awards-interval",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    // Bo Derek tem intervalo de 6 anos (1984-1990)
    // Joel Silver tem intervalo de 1 ano (1990-1991)

    // Verifica min (Joel Silver com 1 ano)
    expect(body.min.length).toBeGreaterThan(0);
    const joelSilver = body.min.find(
      (item: { producer: string }) => item.producer === "Joel Silver",
    );
    expect(joelSilver).toBeDefined();
    expect(joelSilver.interval).toBe(1);
    expect(joelSilver.previousWin).toBe(1990);
    expect(joelSilver.followingWin).toBe(1991);

    // Verifica max (Bo Derek com 6 anos)
    expect(body.max.length).toBeGreaterThan(0);
    const boDerek = body.max.find(
      (item: { producer: string }) => item.producer === "Bo Derek",
    );
    expect(boDerek).toBeDefined();
    expect(boDerek.interval).toBe(6);
    expect(boDerek.previousWin).toBe(1984);
    expect(boDerek.followingWin).toBe(1990);
  });
});
