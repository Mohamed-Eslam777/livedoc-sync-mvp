// Shared types for the LiveDoc Sync application

export type RunStatus = 'queued' | 'running' | 'success' | 'fail' | 'ignored';

export type Confidence = 'high' | 'medium' | 'low';

export interface LLMResponse {
    summary_markdown: string;
    docs_checklist_markdown: string;
    suggested_patch_markdown: string;
    confidence: Confidence;
    evidence: string[];
}

export interface WebhookJobPayload {
    githubInstallationId: number;
    githubRepoId: number;
    prNumber: number;
    prUrl: string;
    prTitle: string;
    prHeadSha: string;
    repoFullName: string;
}
