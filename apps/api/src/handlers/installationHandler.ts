import { FastifyBaseLogger } from 'fastify';
import { InstallationEvent, prisma } from '@livedoc-sync/shared';

export async function handleInstallationEvent(
    event: InstallationEvent,
    logger: FastifyBaseLogger
) {
    const { action, installation } = event;

    logger.info(
        {
            action,
            installation: installation.id,
            account: installation.account.login,
        },
        'Processing installation event'
    );

    try {
        if (action === 'created') {
            // Create installation record
            await prisma.installation.upsert({
                where: { githubInstallationId: installation.id },
                create: {
                    githubInstallationId: installation.id,
                    accountLogin: installation.account.login,
                    accountType: installation.account.type,
                },
                update: {
                    accountLogin: installation.account.login,
                    accountType: installation.account.type,
                    updatedAt: new Date(),
                },
            });

            logger.info({ installation: installation.id }, 'Installation created/updated');
        } else if (action === 'deleted') {
            // Optionally handle uninstall (cascade delete will handle repos/runs)
            await prisma.installation.delete({
                where: { githubInstallationId: installation.id },
            });

            logger.info({ installation: installation.id }, 'Installation deleted');
        }
    } catch (error) {
        logger.error(error, 'Error handling installation event');
        throw error;
    }
}
