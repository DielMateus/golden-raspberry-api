import Fastify, { FastifyInstance } from "fastify";
import { producerRoutes } from "./routes/producerRoutes.js";

export function buildApp(options = {}): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
    ...options,
  });

  app.register(producerRoutes);

  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  return app;
}
