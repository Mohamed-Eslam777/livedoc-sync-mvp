import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { verifyWebhookSignature } from '../utils/webhookVerifier';
import { pullRequestEventSchema, installationEventSchema } from '@livedoc-sync/shared';
import { handlePullRequestEvent } from '../handlers/pullRequestHandler';
import { handleInstallationEvent } from '../handlers/installationHandler';

export const webhookRoute: FastifyPluginAsync = async (server) => {
    server.post(
        '/api/webhooks/github',
        {
            config: {
                rateLimit: {
                    max: 200,
                    timeWindow: '1 minute',
                },
            },
        },
        async (request: FastifyRequest, reply) => {
            try {
                const signature = request.headers['x-hub-signature-256'] as string;
                const event = request.headers['x-github-event'] as string;
                const payload = request.body;

                if (!signature || !event) {
                    return reply.code(400).send({ error: 'Missing required headers' });
                }

                // Verify webhook signature
                const isValid = verifyWebhookSignature(
                    JSON.stringify(payload),
                    signature,
                    process.env.GITHUB_WEBHOOK_SECRET!
                );

                if (!isValid) {
                    server.log.warn('Invalid webhook signature');
                    return reply.code(401).send({ error: 'Invalid signature' });
                }

                server.log.info({ event }, 'Received GitHub webhook');

                // Route to appropriate handler
                if (event === 'pull_request') {
                    const parsed = pullRequestEventSchema.safeParse(payload);
                    if (!parsed.success) {
                        server.log.error({ errors: parsed.error.errors }, 'Invalid pull_request payload');
                        return reply.code(400).send({ error: 'Invalid payload' });
                    }
                    await handlePullRequestEvent(parsed.data, server.log);
                } else if (event === 'installation' || event === 'installation_repositories') {
                    const parsed = installationEventSchema.safeParse(payload);
                    if (!parsed.success) {
                        server.log.error({ errors: parsed.error.errors }, 'Invalid installation payload');
                        return reply.code(400).send({ error: 'Invalid payload' });
                    }
                    await handleInstallationEvent(parsed.data, server.log);
                } else {
                    server.log.info({ event }, 'Unhandled webhook event');
                }

                return reply.code(200).send({ received: true });
            } catch (error) {
                server.log.error(error, 'Error processing webhook');
                return reply.code(500).send({ error: 'Internal server error' });
            }
        }
    );
};
