import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { WebhookJobPayload, prisma } from '@livedoc-sync/shared';
import { processJob } from './processor/jobProcessor';

dotenv.config();

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});

const worker = new Worker<WebhookJobPayload>(
    'pr-analysis',
    async (job: Job<WebhookJobPayload>) => {
        console.log(`[Worker] Processing job ${job.id} for PR #${job.data.prNumber}`);
        await processJob(job.data);
    },
    {
        connection: redisConnection,
        concurrency: 5, // Process up to 5 jobs concurrently
    }
);

worker.on('completed', (job) => {
    console.log(`✅ [Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`❌ [Worker] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
    console.error('❌ [Worker] Error:', err);
});

console.log('🚀 Worker started and listening for jobs...');

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down worker...');
    await worker.close();
    await prisma.$disconnect();
    process.exit(0);
});
