import { AnalysisContext } from './provider';
import { OpenAIProvider } from './openaiProvider';
import { LLMResponse } from '@livedoc-sync/shared';

// Factory pattern for LLM provider
// Can be extended to support other providers (Anthropic, Gemini, etc.)
const provider = new OpenAIProvider();

export async function analyzeWithLLM(context: AnalysisContext): Promise<LLMResponse> {
    return provider.analyze(context);
}
