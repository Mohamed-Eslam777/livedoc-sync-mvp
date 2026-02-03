import { FastifyPluginAsync } from 'fastify';

export const healthRoute: FastifyPluginAsync = async (server) => {
    server.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
};
