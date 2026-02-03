import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';
import { WebhookJobPayload } from '@livedoc-sync/shared';

export const prAnalysisQueue = new Queue<WebhookJobPayload>('pr-analysis', {
    connection: redisClient,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000, // Start with 1s, then 2s, 4s
        },
        removeOnComplete: {
            count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
            count: 200, // Keep last 200 failed jobs for debugging
        },
    },
});

prAnalysisQueue.on('error', (err) => {
    console.error('Queue error:', err);
});
