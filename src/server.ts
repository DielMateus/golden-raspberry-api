import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { buildApp } from "./app.js";
import { loadCSVData } from "./database/seed.js";

// Obtém o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurações do servidor
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

/**
 * Inicializa e inicia o servidor
 */
async function start(): Promise<void> {
  const app = buildApp();

  try {
    // Carrega os dados do CSV ao iniciar a aplicação
    const csvPath = resolve(__dirname, "../data/movielist.csv");
    console.log(`Loading CSV data from: ${csvPath}`);
    loadCSVData(csvPath);
    console.log("CSV data loaded successfully!");

    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
