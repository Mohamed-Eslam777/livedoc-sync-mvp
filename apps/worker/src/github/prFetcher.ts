import { Octokit } from '@octokit/rest';

export interface PRDetails {
    title: string;
    body: string | null;
    files: string[];
}

/**
 * Fetches PR details including title, body, and changed files
 */
export async function fetchPRDetails(
    octokit: Octokit,
    owner: string,
    repo: string,
    prNumber: number
): Promise<PRDetails> {
    const { data: pr } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
    });

    const { data: files } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
    });

    return {
        title: pr.title,
        body: pr.body,
        files: files.map((f) => f.filename),
    };
}

/**
 * Fetches PR diff in unified format
 */
export async function fetchPRDiff(
    octokit: Octokit,
    owner: string,
    repo: string,
    prNumber: number
): Promise<string> {
    const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
        mediaType: {
            format: 'diff',
        },
    });

    return data as unknown as string;
}
