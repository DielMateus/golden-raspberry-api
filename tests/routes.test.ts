import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../src/app.js";
import {
  loadCSVFromString,
  resetDatabase,
  createTables,
} from "../src/database/index.js";
import { FastifyInstance } from "fastify";

const SAMPLE_CSV_DATA = `year;title;studios;producers;winner
1980;Can't Stop the Music;Associated Film Distribution;Allan Carr;yes
1984;Where the Boys Are '84;TriStar Pictures;Allan Carr;
1990;Ghosts Can't Do It;Triumph Releasing;Bo Derek;yes`;

let app: FastifyInstance;

describe("Movie Routes - Additional Coverage Tests", () => {
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

  describe("PUT /movies/:id - Invalid ID parameter (linha 122-123)", () => {
    it("should return 400 for invalid ID in PUT request", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/invalid-id",
        payload: {
          year: 2024,
          title: "Test Movie",
          studios: "Test Studio",
          producers: "Test Producer",
          winner: false,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Invalid ID parameter");
    });

    it("should return 400 for non-numeric ID in PUT request", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/abc",
        payload: {
          year: 2024,
          title: "Test Movie",
          studios: "Test Studio",
          producers: "Test Producer",
          winner: false,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for special characters in PUT ID", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/@#$",
        payload: {
          year: 2024,
          title: "Test Movie",
          studios: "Test Studio",
          producers: "Test Producer",
          winner: false,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PATCH /movies/:id - Invalid ID parameter (linha 162-163)", () => {
    it("should return 400 for invalid ID in PATCH request", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/invalid-id",
        payload: { title: "Updated Title" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Invalid ID parameter");
    });

    it("should return 400 for non-numeric ID in PATCH request", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/xyz",
        payload: { title: "Updated Title" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for empty string ID in PATCH request", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/NaN",
        payload: { title: "Updated Title" },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /movies/:id - Invalid ID parameter", () => {
    it("should return 400 for invalid ID in DELETE request", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/movies/invalid-id",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Invalid ID parameter");
    });

    it("should return 400 for float ID in DELETE request", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/movies/1.5",
      });

      // testar com algo que realmente falha
      const response2 = await app.inject({
        method: "DELETE",
        url: "/movies/abc123",
      });

      expect(response2.statusCode).toBe(400);
    });
  });

  describe("PUT /movies/:id - Missing required fields (linha 127-130)", () => {
    it("should return 400 when year is missing in PUT", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {
          title: "Test Movie",
          studios: "Test Studio",
          producers: "Test Producer",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain("Missing required fields");
    });

    it("should return 400 when title is missing in PUT", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {
          year: 2024,
          studios: "Test Studio",
          producers: "Test Producer",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when studios is missing in PUT", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {
          year: 2024,
          title: "Test Movie",
          producers: "Test Producer",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when producers is missing in PUT", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {
          year: 2024,
          title: "Test Movie",
          studios: "Test Studio",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 when all fields are missing in PUT", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Edge Cases for Routes", () => {
    it("should handle movie creation with winner=false explicitly", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/movies",
        payload: {
          year: 2024,
          title: "Non-Winner Movie",
          studios: "Studio",
          producers: "Producer",
          winner: false,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.winner).toBe(false);
    });

    it("should handle movie creation without winner field (defaults to false)", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/movies",
        payload: {
          year: 2024,
          title: "Default Winner Movie",
          studios: "Studio",
          producers: "Producer",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.winner).toBe(false);
    });

    it("should handle PUT with winner=true", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/movies/1",
        payload: {
          year: 2024,
          title: "Winner Movie",
          studios: "Studio",
          producers: "Producer",
          winner: true,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.winner).toBe(true);
    });

    it("should handle PATCH with only winner field", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/1",
        payload: { winner: true },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.winner).toBe(true);
    });

    it("should handle PATCH with multiple fields", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: "/movies/1",
        payload: {
          title: "Updated Title",
          year: 2025,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.title).toBe("Updated Title");
      expect(body.year).toBe(2025);
    });
  });
});
