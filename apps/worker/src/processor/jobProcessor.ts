import { WebhookJobPayload, prisma } from '@livedoc-sync/shared';
import { getInstallationOctokit } from '../github/auth';
import { fetchPRDetails, fetchPRDiff } from '../github/prFetcher';
import { truncateAndRedactDiff } from '../utils/diffProcessor';
import { analyzeWithLLM } from '../llm/llmClient';
import { postPRComment } from '../github/commentPoster';

export async function processJob(payload: WebhookJobPayload) {
    const { githubInstallationId, githubRepoId, prNumber, prUrl, prTitle, prHeadSha, repoFullName } =
        payload;

    // Create Run record
    const repo = await prisma.repo.findUnique({
        where: { githubRepoId },
    });

    if (!repo) {
        throw new Error(`Repo not found for githubRepoId: ${githubRepoId}`);
    }

    const run = await prisma.run.create({
        data: {
            repoId: repo.id,
            prNumber,
            prUrl,
            prTitle,
            prHeadSha,
            status: 'running',
        },
    });

    try {
        // Get GitHub App installation token
        const octokit = await getInstallationOctokit(githubInstallationId);

        // Fetch PR details and diff
        const [owner, repoName] = repoFullName.split('/');
        const prDetails = await fetchPRDetails(octokit, owner, repoName, prNumber);
        const prDiff = await fetchPRDiff(octokit, owner, repoName, prNumber);

        // Process diff (truncate and redact)
        const processedDiff = truncateAndRedactDiff(prDiff);

        // Analyze with LLM
        const analysis = await analyzeWithLLM({
            prTitle,
            prBody: prDetails.body || '',
            filesChanged: prDetails.files,
            diff: processedDiff.content,
            truncated: processedDiff.truncated,
        });

        // Post PR comment
        await postPRComment(octokit, owner, repoName, prNumber, {
            summary: analysis.summary_markdown,
            docsChecklist: analysis.docs_checklist_markdown,
            suggestedPatch: analysis.suggested_patch_markdown,
            confidence: analysis.confidence,
            truncated: processedDiff.truncated,
        });

        // Update Run record
        await prisma.run.update({
            where: { id: run.id },
            data: {
                status: 'success',
                summaryMarkdown: analysis.summary_markdown,
                docsChecklistMarkdown: analysis.docs_checklist_markdown,
                suggestedPatchMarkdown: analysis.suggested_patch_markdown,
                confidence: analysis.confidence,
                evidence: analysis.evidence,
            },
        });

        console.log(`✅ Successfully processed PR #${prNumber} for ${repoFullName}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Update Run record as failed
        await prisma.run.update({
            where: { id: run.id },
            data: {
                status: 'fail',
                errorMessage,
            },
        });

        console.error(`❌ Failed to process PR #${prNumber}:`, errorMessage);
        throw error; // Re-throw for BullMQ retry logic
    }
}
