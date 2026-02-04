import { describe, it, expect } from "vitest";
import { createTables, dropTables } from "../src/database/schema";
import { getDatabase } from "../src/database/connection";

describe("Database Schema", () => {
  it("should drop and recreate tables and indexes successfully", () => {
    const db = getDatabase();

    expect(() => dropTables()).not.toThrow();

    const tableExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='movies'",
      )
      .get();
    expect(tableExists).toBeUndefined();

    expect(() => createTables()).not.toThrow();

    expect(() => createTables()).not.toThrow();

    // Verifica se os índices foram criados
    const indices = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='movies'",
      )
      .all();

    const indexNames = indices.map((idx: any) => idx.name);
    expect(indexNames).toContain("idx_movies_winner");
    expect(indexNames).toContain("idx_movies_year");
  });
});
