import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prizeIntervalService } from "../services/prizeIntervalService.js";

export async function producerRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    "/producers/awards-interval",
    async (_request: FastifyRequest, _reply: FastifyReply) => {
      return prizeIntervalService.getPrizeIntervals();
    },
  );
}
