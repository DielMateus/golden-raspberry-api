import Database from 'better-sqlite3';

/**
 * Instância do banco de dados SQLite em memória
 * Utilizamos ':memory:' para criar um banco de dados em memória
 * que não persiste após o encerramento da aplicação
 */
let db: Database.Database | null = null;

/**
 * Obtém a instância do banco de dados
 * Cria uma nova instância se não existir
 */
export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

/**
 * Fecha a conexão com o banco de dados
 * Útil para testes e limpeza de recursos
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reseta o banco de dados (útil para testes)
 * Fecha a conexão atual e permite criar uma nova
 */
export function resetDatabase(): void {
  closeDatabase();
}
