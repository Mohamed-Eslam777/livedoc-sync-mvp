import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import { healthRoute } from './routes/health';
import { webhookRoute } from './routes/webhook';
import { errorHandler } from './utils/errorHandler';
import { redisClient } from './config/redis';

dotenv.config();

const server = Fastify({
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
        // Redact sensitive headers
        redact: ['req.headers.authorization', 'req.headers["x-hub-signature-256"]'],
    },
});

async function start() {
    try {
        // Register CORS
        await server.register(cors, {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            credentials: true,
        });

        // Register rate limiting  
        await server.register(rateLimit, {
            max: 100,
            timeWindow: '1 minute',
            redis: redisClient,
        });

        // Register routes
        await server.register(healthRoute);
        await server.register(webhookRoute);

        // Set error handler
        server.setErrorHandler(errorHandler);

        const port = Number(process.env.API_PORT) || 3001;
        const host = process.env.API_HOST || '0.0.0.0';

        await server.listen({ port, host });
        console.log(`✅ API server running on http://${host}:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

start();
