import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

const APP_ID = process.env.GITHUB_APP_ID!;
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY!;

if (!APP_ID || !PRIVATE_KEY) {
    throw new Error('Missing required env vars: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY');
}

/**
 * Creates an Octokit instance authenticated as a GitHub App installation
 * Installation tokens are short-lived (1 hour) and generated per request
 */
export async function getInstallationOctokit(installationId: number): Promise<Octokit> {
    const appAuth = createAppAuth({
        appId: APP_ID,
        privateKey: PRIVATE_KEY,
        installationId,
    });

    const { token } = await appAuth({ type: 'installation' });

    return new Octokit({
        auth: token,
    });
}
