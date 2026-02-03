import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) {
    const statusCode = error.statusCode || 500;

    // Log error (logger already redacts sensitive headers)
    request.log.error(
        {
            error: {
                message: error.message,
                code: error.code,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            url: request.url,
            method: request.method,
        },
        'Request error'
    );

    // Send user-friendly error
    reply.status(statusCode).send({
        error: error.message || 'Internal server error',
        statusCode,
    });
}
