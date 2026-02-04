import { getDatabase } from "./connection.js";

/**
 * Cria as tabelas necessárias no banco de dados
 */
export function createTables(): void {
  const db = getDatabase();

  // Tabela de filmes
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      studios TEXT NOT NULL,
      producers TEXT NOT NULL,
      winner INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Índice para otimizar consultas por vencedores
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_winner ON movies(winner)
  `);

  // Índice para otimizar consultas por ano
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year)
  `);
}

/**
 * Remove todas as tabelas do banco de dados
 */
export function dropTables(): void {
  const db = getDatabase();
  db.exec("DROP TABLE IF EXISTS movies");
}
