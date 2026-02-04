import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prizeIntervalService } from "../services/prizeIntervalService.js";

/**
 * Registra as rotas de produtores
 * Implementa o endpoint principal do desafio
 */
export async function producerRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /producers/awards-interval
   * Retorna o produtor com maior intervalo entre dois prêmios consecutivos,
   * e o que obteve dois prêmios mais rápido
   */
  fastify.get(
    "/producers/awards-interval",
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return prizeIntervalService.getPrizeIntervals();
    },
  );
}
