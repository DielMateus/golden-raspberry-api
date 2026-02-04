import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { getDatabase } from "./connection.js";
import { createTables } from "./schema.js";
import type { MovieCSVRecord } from "../types/index.js";

/**
 * Carrega os dados do arquivo CSV para o banco de dados
 * @param csvPath - Caminho para o arquivo CSV
 */
export function loadCSVData(csvPath: string): void {
  const db = getDatabase();

  // Cria as tabelas se não existirem
  createTables();

  // Lê o arquivo CSV
  const csvContent = readFileSync(csvPath, "utf-8");

  // Parseia o CSV com delimitador ponto e vírgula
  const records: MovieCSVRecord[] = parse(csvContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  // Prepara a query de inserção
  const insertStmt = db.prepare(`
    INSERT INTO movies (year, title, studios, producers, winner)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Insere os registros em uma transação para melhor performance
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

/**
 * Carrega dados do CSV a partir de uma string (útil para testes)
 * @param csvContent - Conteúdo do CSV como string
 */
export function loadCSVFromString(csvContent: string): void {
  const db = getDatabase();

  createTables();

  const records: MovieCSVRecord[] = parse(csvContent, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    trim: true,
  });

  // Prepara a query de inserção
  const insertStmt = db.prepare(`
    INSERT INTO movies (year, title, studios, producers, winner)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Insere os registros em uma transação
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
