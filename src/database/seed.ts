import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { getDatabase } from "./connection.js";
import { createTables } from "./schema.js";
import type { MovieCSVRecord } from "../types/index.js";

export function loadCSVData(csvPath: string): void {
  const db = getDatabase();

  createTables();

  const csvContent = readFileSync(csvPath, "utf-8");

  const records: MovieCSVRecord[] = parse(csvContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  const insertStmt = db.prepare(`
    INSERT INTO movies (year, title, studios, producers, winner)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((records: MovieCSVRecord[]) => {
    for (const record of records) {
      const isWinner = record.winner?.toLowerCase() === "yes" ? 1 : 0;

      insertStmt.run(
        parseInt(record.year, 10),
        record.title,
        record.studios,
        record.producers,
        isWinner,
      );
    }
  });

  insertMany(records);
}

export function loadCSVFromString(csvContent: string): void {
  const db = getDatabase();

  createTables();

  const records: MovieCSVRecord[] = parse(csvContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  const insertStmt = db.prepare(`
    INSERT INTO movies (year, title, studios, producers, winner)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((records: MovieCSVRecord[]) => {
    for (const record of records) {
      const isWinner = record.winner?.toLowerCase() === "yes" ? 1 : 0;

      insertStmt.run(
        parseInt(record.year, 10),
        record.title,
        record.studios,
        record.producers,
        isWinner,
      );
    }
  });

  insertMany(records);
}
