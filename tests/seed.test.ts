import { describe, it, expect, vi } from "vitest";
import { loadCSVData } from "../src/database/seed";
import fs from "fs";
import path from "path";

describe("Database Seeding", () => {
  const csvPath = path.resolve(__dirname, "../data/movielist.csv");

  it("should handle seed process correctly with valid file", () => {
    expect(() => loadCSVData(csvPath)).not.toThrow();
  });

  it("should handle file system errors during seeding", () => {
    // Mockei o readFileSync para disparar um erro
    const readSpy = vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw new Error("File not found");
    });

    // Lança o erro ao encontrar falha no FS
    expect(() => loadCSVData("invalid/path.csv")).toThrow();

    readSpy.mockRestore();
  });
});
