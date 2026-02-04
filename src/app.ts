import Fastify, { FastifyInstance } from "fastify";
import { movieRoutes } from "./routes/movieRoutes.js";
import { producerRoutes } from "./routes/producerRoutes.js";

/**
 * Cria e configura a instância do Fastify
 * @param options - Opções de configuração do Fastify
 * @returns Instância configurada do Fastify
 */
export function buildApp(options = {}): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
    ...options,
  });

  // Registra as rotas
  app.register(movieRoutes);
  app.register(producerRoutes);

  // Rota de health check
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Rota raiz com informações da API
  app.get("/", async () => {
    return {
      name: "Golden Raspberry Awards API",
      version: "1.0.0",
      description:
        "API RESTful para leitura de indicados e vencedores do Golden Raspberry Awards",
      endpoints: {
        movies: {
          "GET /movies": "Lista todos os filmes",
          "GET /movies?year={year}": "Lista filmes por ano",
          "GET /movies?winner=true": "Lista apenas vencedores",
          "GET /movies/:id": "Obtém um filme por ID",
          "POST /movies": "Cria um novo filme",
          "PUT /movies/:id": "Atualiza um filme (substituição completa)",
          "PATCH /movies/:id": "Atualiza parcialmente um filme",
          "DELETE /movies/:id": "Remove um filme",
        },
        producers: {
          "GET /producers/awards-interval":
            "Obtém intervalos de prêmios dos produtores",
        },
        health: {
          "GET /health": "Verifica status da API",
        },
      },
    };
  });

  return app;
}
