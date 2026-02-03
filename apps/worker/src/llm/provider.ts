import { LLMResponse } from '@livedoc-sync/shared';

export interface LLMProvider {
    analyze(context: AnalysisContext): Promise<LLMResponse>;
}

export interface AnalysisContext {
    prTitle: string;
    prBody: string;
    filesChanged: string[];
    diff: string;
    truncated: boolean;
}
