import OpenAI from 'openai';
import { LLMProvider, AnalysisContext } from './provider';
import { LLMResponse, llmResponseSchema } from '@livedoc-sync/shared';

const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
const LLM_API_KEY = process.env.LLM_API_KEY!;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4-turbo-preview';

if (!LLM_API_KEY) {
    throw new Error('Missing LLM_API_KEY environment variable');
}

export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: LLM_BASE_URL,
            apiKey: LLM_API_KEY,
        });
    }

    async analyze(context: AnalysisContext): Promise<LLMResponse> {
        const prompt = this.buildPrompt(context);

        try {
            const response = await this.client.chat.completions.create({
                model: LLM_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from LLM');
            }

            // Parse and validate JSON response
            const parsed = JSON.parse(content);
            const validated = llmResponseSchema.parse(parsed);

            return validated;
        } catch (error) {
            console.error('LLM analysis error:', error);

            // Fallback response
            return {
                summary_markdown: `⚠️ **AI Analysis Failed**\n\nUnable to analyze PR at this time. Please review manually.`,
                docs_checklist_markdown: '- Review documentation manually',
                suggested_patch_markdown: '',
                confidence: 'low',
                evidence: [],
            };
        }
    }

    private buildPrompt(context: AnalysisContext): string {
        const truncationNote = context.truncated
            ? '\n\n**NOTE: The diff was truncated due to size. Analysis may be incomplete.**'
            : '';

        return `
Analyze this Pull Request and provide documentation impact assessment.

**PR Title:** ${context.prTitle}

**PR Description:**
${context.prBody || 'No description provided'}

**Files Changed:**
${context.filesChanged.map((f) => `- ${f}`).join('\n')}

**Diff:**
\`\`\`diff
${context.diff}
\`\`\`
${truncationNote}

Respond with a JSON object matching this schema:
{
  "summary_markdown": "Brief summary of what changed",
  "docs_checklist_markdown": "Markdown list of docs that likely need updates",
  "suggested_patch_markdown": "Suggested docs patch as markdown code block (can be empty)",
  "confidence": "high" | "medium" | "low",
  "evidence": ["file1.ts", "file2.ts"]
}
`.trim();
    }
}

const SYSTEM_PROMPT = `You are an expert documentation analyst for GitHub repositories.

Your job is to:
1. Analyze Pull Request changes (title, description, diff)
2. Identify what documentation files likely need updates (README.md, docs/*.md)
3. Suggest specific documentation patches if possible
4. Set confidence based on available evidence

CRITICAL RULES:
- Only claim changes supported by the diff context
- If uncertain, set confidence to "low" and ask for human review
- NEVER output secrets, API keys, or tokens
- If secrets are detected in the diff, instruct user to rotate them immediately
- Cite specific files in the "evidence" array
- Be concise but helpful in your markdown output

Output MUST be valid JSON matching the schema provided.`;
