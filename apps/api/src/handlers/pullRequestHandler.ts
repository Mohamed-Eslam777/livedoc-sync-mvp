import { FastifyBaseLogger } from 'fastify';
import { PullRequestEvent, prisma } from '@livedoc-sync/shared';
import { prAnalysisQueue } from '../queues/prAnalysisQueue';

export async function handlePullRequestEvent(
    event: PullRequestEvent,
    logger: FastifyBaseLogger
) {
    const { action, pull_request, repository, installation } = event;

    logger.info(
        {
            action,
            pr: pull_request.number,
            repo: repository.full_name,
            installation: installation.id,
        },
        'Processing pull_request event'
    );

    // Skip draft PRs (optional)
    if (pull_request.draft) {
        logger.info({ pr: pull_request.number }, 'Skipping draft PR');
        return;
    }

    try {
        // Upsert Installation
        const installationRecord = await prisma.installation.upsert({
            where: { githubInstallationId: installation.id },
            create: {
                githubInstallationId: installation.id,
                accountLogin: repository.owner.login,
                accountType: 'Organization', // Could be User or Organization
            },
            update: {
                accountLogin: repository.owner.login,
                updatedAt: new Date(),
            },
        });

        // Upsert Repo (auto-register with enabled=true)
        const repoRecord = await prisma.repo.upsert({
            where: { githubRepoId: repository.id },
            create: {
                githubRepoId: repository.id,
                owner: repository.owner.login,
                name: repository.name,
                fullName: repository.full_name,
                enabled: true,
                installationId: installationRecord.id,
            },
            update: {
                owner: repository.owner.login,
                name: repository.name,
                fullName: repository.full_name,
                updatedAt: new Date(),
            },
        });

        // Check if repo is enabled
        if (!repoRecord.enabled) {
            logger.info({ repo: repository.full_name }, 'Repo is disabled, skipping');
            return;
        }

        // Create dedupe key for idempotency
        const dedupeKey = `${installation.id}:${repository.id}:${pull_request.number}:${pull_request.head.sha}`;

        // Enqueue job
        await prAnalysisQueue.add(
            'analyze-pr',
            {
                githubInstallationId: installation.id,
                githubRepoId: repository.id,
                prNumber: pull_request.number,
                prUrl: pull_request.html_url,
                prTitle: pull_request.title,
                prHeadSha: pull_request.head.sha,
                repoFullName: repository.full_name,
            },
            {
                jobId: dedupeKey, // Prevents duplicate jobs for same PR + SHA
            }
        );

        logger.info({ pr: pull_request.number, repo: repository.full_name }, 'Job enqueued');
    } catch (error) {
        logger.error(error, 'Error handling pull_request event');
        throw error;
    }
}
