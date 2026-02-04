import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { movieService } from '../services/movieService.js';


/**
 * Schema para criação/atualização de filme
 */
interface MovieBody {
  year: number;
  title: string;
  studios: string;
  producers: string;
  winner?: boolean;
}

/**
 * Parâmetros de rota com ID
 */
interface IdParams {
  id: string;
}

/**
 * Query params para filtros
 */
interface MovieQuery {
  year?: string;
  winner?: string;
}

/**
 * Registra as rotas de filmes
 * Implementa nível 2 de maturidade de Richardson (verbos HTTP + recursos)
 */
export async function movieRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /movies
   * Lista todos os filmes com filtros opcionais
   */
  fastify.get<{ Querystring: MovieQuery }>(
    '/movies',
    async (request: FastifyRequest<{ Querystring: MovieQuery }>, reply: FastifyReply) => {
      const { year, winner } = request.query;

      // Filtro por ano
      if (year) {
        const yearNum = parseInt(year, 10);
        if (isNaN(yearNum)) {
          return reply.status(400).send({ error: 'Invalid year parameter' });
        }
        return movieService.getByYear(yearNum);
      }

      // Filtro por vencedores
      if (winner === 'true') {
        return movieService.getWinners();
      }

      // Retorna todos os filmes
      return movieService.getAll();
    }
  );

  /**
   * GET /movies/:id
   * Obtém um filme específico por ID
   */
  fastify.get<{ Params: IdParams }>(
    '/movies/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid ID parameter' });
      }

      const movie = movieService.getById(id);

      if (!movie) {
        return reply.status(404).send({ error: 'Movie not found' });
      }

      return movie;
    }
  );

  /**
   * POST /movies
   * Cria um novo filme
   */
  fastify.post<{ Body: MovieBody }>(
    '/movies',
    async (request: FastifyRequest<{ Body: MovieBody }>, reply: FastifyReply) => {
      const { year, title, studios, producers, winner = false } = request.body;

      // Validação básica
      if (!year || !title || !studios || !producers) {
        return reply.status(400).send({
          error: 'Missing required fields: year, title, studios, producers',
        });
      }

      const movie = movieService.create({
        year,
        title,
        studios,
        producers,
        winner,
      });

      return reply.status(201).send(movie);
    }
  );

  /**
   * PUT /movies/:id
   * Atualiza um filme existente (substituição completa)
   */
  fastify.put<{ Params: IdParams; Body: MovieBody }>(
    '/movies/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: MovieBody }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid ID parameter' });
      }

      const { year, title, studios, producers, winner = false } = request.body;

      // Validação básica
      if (!year || !title || !studios || !producers) {
        return reply.status(400).send({
          error: 'Missing required fields: year, title, studios, producers',
        });
      }

      const movie = movieService.update(id, {
        year,
        title,
        studios,
        producers,
        winner,
      });

      if (!movie) {
        return reply.status(404).send({ error: 'Movie not found' });
      }

      return movie;
    }
  );

  /**
   * PATCH /movies/:id
   * Atualiza parcialmente um filme existente
   */
  fastify.patch<{ Params: IdParams; Body: Partial<MovieBody> }>(
    '/movies/:id',
    async (
      request: FastifyRequest<{ Params: IdParams; Body: Partial<MovieBody> }>,
      reply: FastifyReply
    ) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid ID parameter' });
      }

      const movie = movieService.update(id, request.body);

      if (!movie) {
        return reply.status(404).send({ error: 'Movie not found' });
      }

      return movie;
    }
  );

  /**
   * DELETE /movies/:id
   * Remove um filme
   */
  fastify.delete<{ Params: IdParams }>(
    '/movies/:id',
    async (request: FastifyRequest<{ Params: IdParams }>, reply: FastifyReply) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'Invalid ID parameter' });
      }

      const deleted = movieService.delete(id);

      if (!deleted) {
        return reply.status(404).send({ error: 'Movie not found' });
      }

      return reply.status(204).send();
    }
  );
}
