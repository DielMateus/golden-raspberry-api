import { getDatabase } from "../database/connection.js";
import type { Movie } from "../types/index.js";

/**
 * Serviço para operações com filmes
 */
export class MovieService {
  getAll(): Movie[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM movies ORDER BY year DESC, title ASC",
    );
    const rows = stmt.all() as Array<{
      id: number;
      year: number;
      title: string;
      studios: string;
      producers: string;
      winner: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      studios: row.studios,
      producers: row.producers,
      winner: row.winner === 1,
    }));
  }

  /**
   * Obtém um filme por ID
   */
  getById(id: number): Movie | null {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM movies WHERE id = ?");
    const row = stmt.get(id) as
      | {
          id: number;
          year: number;
          title: string;
          studios: string;
          producers: string;
          winner: number;
        }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      year: row.year,
      title: row.title,
      studios: row.studios,
      producers: row.producers,
      winner: row.winner === 1,
    };
  }

  /**
   * Obtém todos os filmes vencedores
   */
  getWinners(): Movie[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM movies WHERE winner = 1 ORDER BY year ASC",
    );
    const rows = stmt.all() as Array<{
      id: number;
      year: number;
      title: string;
      studios: string;
      producers: string;
      winner: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      studios: row.studios,
      producers: row.producers,
      winner: true,
    }));
  }

  /**
   * Obtém filmes por ano
   */
  getByYear(year: number): Movie[] {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT * FROM movies WHERE year = ? ORDER BY title ASC",
    );
    const rows = stmt.all(year) as Array<{
      id: number;
      year: number;
      title: string;
      studios: string;
      producers: string;
      winner: number;
    }>;

    return rows.map((row) => ({
      id: row.id,
      year: row.year,
      title: row.title,
      studios: row.studios,
      producers: row.producers,
      winner: row.winner === 1,
    }));
  }

  /**
   * Cria um novo filme
   */
  create(movie: Omit<Movie, "id">): Movie {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO movies (year, title, studios, producers, winner)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      movie.year,
      movie.title,
      movie.studios,
      movie.producers,
      movie.winner ? 1 : 0,
    );

    return {
      id: result.lastInsertRowid as number,
      ...movie,
    };
  }

  /**
   * Atualiza um filme existente
   */
  update(id: number, movie: Partial<Omit<Movie, "id">>): Movie | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updated = { ...existing, ...movie };

    const stmt = db.prepare(`
      UPDATE movies
      SET year = ?, title = ?, studios = ?, producers = ?, winner = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.year,
      updated.title,
      updated.studios,
      updated.producers,
      updated.winner ? 1 : 0,
      id,
    );

    return updated;
  }

  /**
   * Remove um filme
   */
  delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM movies WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Conta o total de filmes
   */
  count(): number {
    const db = getDatabase();
    const stmt = db.prepare("SELECT COUNT(*) as count FROM movies");
    const result = stmt.get() as { count: number };
    return result.count;
  }

  /**
   * Conta o total de vencedores
   */
  countWinners(): number {
    const db = getDatabase();
    const stmt = db.prepare(
      "SELECT COUNT(*) as count FROM movies WHERE winner = 1",
    );
    const result = stmt.get() as { count: number };
    return result.count;
  }
}

export const movieService = new MovieService();
