import { describe, it, expect, beforeEach } from "vitest";
import { movieService } from "../src/services/movieService.js";
import {
  resetDatabase,
  createTables,
  loadCSVFromString,
} from "../src/database/index.js";

/**
 * Testes unitários para o MovieService
 * Foco em cobrir as linhas 181-185 e 191-197 (count e countWinners)
 */
describe("MovieService - Unit Tests", () => {
  beforeEach(() => {
    resetDatabase();
    createTables();
  });

  describe("count()", () => {
    it("should return 0 when database is empty", () => {
      const count = movieService.count();
      expect(count).toBe(0);
    });

    it("should return correct count after inserting movies", () => {
      const csvData = `year;title;studios;producers;winner
        1980;Movie 1;Studio 1;Producer A;yes
        1981;Movie 2;Studio 2;Producer B;no
        1982;Movie 3;Studio 3;Producer C;yes`;

      loadCSVFromString(csvData);

      const count = movieService.count();
      expect(count).toBe(3);
    });

    it("should update count after creating a new movie", () => {
      const initialCount = movieService.count();
      expect(initialCount).toBe(0);

      movieService.create({
        year: 2024,
        title: "New Movie",
        studios: "New Studio",
        producers: "New Producer",
        winner: false,
      });

      const newCount = movieService.count();
      expect(newCount).toBe(1);
    });

    it("should update count after deleting a movie", () => {
      movieService.create({
        year: 2024,
        title: "Movie to Delete",
        studios: "Studio",
        producers: "Producer",
        winner: false,
      });

      expect(movieService.count()).toBe(1);

      movieService.delete(1);

      expect(movieService.count()).toBe(0);
    });
  });

  describe("countWinners()", () => {
    it("should return 0 when database is empty", () => {
      const count = movieService.countWinners();
      expect(count).toBe(0);
    });

    it("should return 0 when there are no winners", () => {
      const csvData = `year;title;studios;producers;winner
        1980;Movie 1;Studio 1;Producer A;
        1981;Movie 2;Studio 2;Producer B;
        1982;Movie 3;Studio 3;Producer C;`;

      loadCSVFromString(csvData);

      const count = movieService.countWinners();
      expect(count).toBe(0);
    });

    it("should return correct count of winners", () => {
      const csvData = `year;title;studios;producers;winner
        1980;Movie 1;Studio 1;Producer A;yes
        1981;Movie 2;Studio 2;Producer B;
        1982;Movie 3;Studio 3;Producer C;yes
        1983;Movie 4;Studio 4;Producer D;`;

      loadCSVFromString(csvData);

      const count = movieService.countWinners();
      expect(count).toBe(2);
    });

    it("should update winner count after creating a winner movie", () => {
      expect(movieService.countWinners()).toBe(0);

      movieService.create({
        year: 2024,
        title: "Winner Movie",
        studios: "Studio",
        producers: "Producer",
        winner: true,
      });

      expect(movieService.countWinners()).toBe(1);
    });

    it("should update winner count after updating a movie to winner", () => {
      const movie = movieService.create({
        year: 2024,
        title: "Non-Winner Movie",
        studios: "Studio",
        producers: "Producer",
        winner: false,
      });

      expect(movieService.countWinners()).toBe(0);

      movieService.update(movie.id, { winner: true });

      expect(movieService.countWinners()).toBe(1);
    });

    it("should update winner count after deleting a winner movie", () => {
      const movie = movieService.create({
        year: 2024,
        title: "Winner Movie",
        studios: "Studio",
        producers: "Producer",
        winner: true,
      });

      expect(movieService.countWinners()).toBe(1);

      movieService.delete(movie.id);

      expect(movieService.countWinners()).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle movie with all fields", () => {
      const movie = movieService.create({
        year: 2024,
        title: "Complete Movie",
        studios: "Complete Studio",
        producers: "Complete Producer",
        winner: true,
      });

      expect(movie.id).toBeDefined();
      expect(movie.year).toBe(2024);
      expect(movie.title).toBe("Complete Movie");
      expect(movie.studios).toBe("Complete Studio");
      expect(movie.producers).toBe("Complete Producer");
      expect(movie.winner).toBe(true);
    });

    it("should handle update with partial data", () => {
      const movie = movieService.create({
        year: 2024,
        title: "Original Title",
        studios: "Original Studio",
        producers: "Original Producer",
        winner: false,
      });

      const updated = movieService.update(movie.id, { title: "Updated Title" });

      expect(updated).not.toBeNull();
      expect(updated!.title).toBe("Updated Title");
      expect(updated!.year).toBe(2024); // Mantém o valor original
      expect(updated!.studios).toBe("Original Studio"); // Mantém o valor original
    });

    it("should return null when updating non-existent movie", () => {
      const result = movieService.update(99999, { title: "New Title" });
      expect(result).toBeNull();
    });

    it("should return false when deleting non-existent movie", () => {
      const result = movieService.delete(99999);
      expect(result).toBe(false);
    });

    it("should return null when getting non-existent movie by ID", () => {
      const result = movieService.getById(99999);
      expect(result).toBeNull();
    });
  });
});
