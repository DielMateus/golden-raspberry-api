import { describe, it, expect, beforeEach } from "vitest";
import {
  getDatabase,
  resetDatabase,
  createTables,
  dropTables,
  loadCSVData,
  loadCSVFromString,
} from "../src/database/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

beforeEach(() => {
  resetDatabase();
});

describe("Database Schema", () => {
  it("should create tables and indexes successfully", () => {
    expect(() => createTables()).not.toThrow();

    const db = getDatabase();
    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='movies'",
      )
      .get() as { name: string } | undefined;

    expect(table).toBeDefined();
    expect(table!.name).toBe("movies");

    const indices = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='movies'",
      )
      .all() as Array<{ name: string }>;

    const indexNames = indices.map((idx) => idx.name);
    expect(indexNames).toContain("idx_movies_winner");
    expect(indexNames).toContain("idx_movies_year");
  });

  it("should drop tables successfully", () => {
    createTables();
    expect(() => dropTables()).not.toThrow();

    const db = getDatabase();
    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='movies'",
      )
      .get();

    expect(table).toBeUndefined();
  });

  it("should handle creating tables multiple times without error", () => {
    expect(() => createTables()).not.toThrow();
    expect(() => createTables()).not.toThrow();
  });
});

describe("Database Seed", () => {
  it("should load the original CSV file with correct number of records", () => {
    const csvPath = path.resolve(__dirname, "../data/movielist.csv");
    loadCSVData(csvPath);

    const db = getDatabase();
    const count = db.prepare("SELECT COUNT(*) as count FROM movies").get() as {
      count: number;
    };

    expect(count.count).toBe(206);
  });

  it("should load the correct number of winners from the original CSV", () => {
    const csvPath = path.resolve(__dirname, "../data/movielist.csv");
    loadCSVData(csvPath);

    const db = getDatabase();
    const count = db
      .prepare("SELECT COUNT(*) as count FROM movies WHERE winner = 1")
      .get() as { count: number };

    expect(count.count).toBe(42);
  });

  it("should load CSV from string correctly", () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1981;Movie B;Studio B;Producer B;`;

    loadCSVFromString(csv);

    const db = getDatabase();
    const count = db.prepare("SELECT COUNT(*) as count FROM movies").get() as {
      count: number;
    };

    expect(count.count).toBe(2);
  });

  it("should correctly identify winners in loaded data", () => {
    const csv = `year;title;studios;producers;winner
1980;Movie A;Studio A;Producer A;yes
1981;Movie B;Studio B;Producer B;
1982;Movie C;Studio C;Producer C;yes`;

    loadCSVFromString(csv);

    const db = getDatabase();
    const winners = db
      .prepare("SELECT COUNT(*) as count FROM movies WHERE winner = 1")
      .get() as { count: number };

    expect(winners.count).toBe(2);
  });

  it("should throw error when loading from invalid file path", () => {
    expect(() => loadCSVData("/invalid/path/file.csv")).toThrow();
  });

  it("should store correct data from the original CSV for the first movie", () => {
    const csvPath = path.resolve(__dirname, "../data/movielist.csv");
    loadCSVData(csvPath);

    const db = getDatabase();
    const firstMovie = db
      .prepare("SELECT * FROM movies WHERE year = 1980 AND winner = 1")
      .get() as {
      title: string;
      producers: string;
      studios: string;
    };

    expect(firstMovie.title).toBe("Can't Stop the Music");
    expect(firstMovie.producers).toBe("Allan Carr");
    expect(firstMovie.studios).toBe("Associated Film Distribution");
  });
});
