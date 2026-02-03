import { z } from 'zod';

// Webhook validation schemas

export const pullRequestEventSchema = z.object({
    action: z.enum(['opened', 'reopened', 'synchronize', 'ready_for_review']),
    number: z.number(),
    pull_request: z.object({
        number: z.number(),
        html_url: z.string().url(),
        title: z.string(),
        body: z.string().nullable(),
        head: z.object({
            sha: z.string(),
        }),
        draft: z.boolean().optional(),
    }),
    repository: z.object({
        id: z.number(),
        name: z.string(),
        full_name: z.string(),
        owner: z.object({
            login: z.string(),
        }),
    }),
    installation: z.object({
        id: z.number(),
    }),
});

export type PullRequestEvent = z.infer<typeof pullRequestEventSchema>;

export const installationEventSchema = z.object({
    action: z.enum(['created', 'deleted']),
    installation: z.object({
        id: z.number(),
        account: z.object({
            login: z.string(),
            type: z.string(),
        }),
    }),
});

export type InstallationEvent = z.infer<typeof installationEventSchema>;

// LLM response schema

export const llmResponseSchema = z.object({
    summary_markdown: z.string(),
    docs_checklist_markdown: z.string(),
    suggested_patch_markdown: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
    evidence: z.array(z.string()),
});

export type LLMResponseSchema = z.infer<typeof llmResponseSchema>;
