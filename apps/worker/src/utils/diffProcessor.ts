const MAX_DIFF_CHARS = 50000; // 50KB

// Secret patterns to redact
const SECRET_PATTERNS = [
    /ghp_[a-zA-Z0-9]{36}/g, // GitHub Personal Access Token
    /ghs_[a-zA-Z0-9]{36}/g, // GitHub OAuth Secret
    /gho_[a-zA-Z0-9]{36}/g, // GitHub OAuth Token
    /github_pat_[a-zA-Z0-9_]{82}/g, // GitHub Fine-grained PAT
    /AKIA[0-9A-Z]{16}/g, // AWS Access Key
    /sk-[a-zA-Z0-9]{48}/g, // OpenAI API Key
    /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
    /[a-zA-Z0-9_-]{32,}/g, // Generic long tokens (broad pattern)
];

export interface ProcessedDiff {
    content: string;
    truncated: boolean;
    redacted: boolean;
}

/**
 * Truncates diff to MAX_DIFF_CHARS and redacts likely secrets
 */
export function truncateAndRedactDiff(diff: string): ProcessedDiff {
    let content = diff;
    let truncated = false;
    let redacted = false;

    // Truncate if too large
    if (content.length > MAX_DIFF_CHARS) {
        content = content.slice(0, MAX_DIFF_CHARS);
        content += '\n\n[... DIFF TRUNCATED FOR SIZE ...]';
        truncated = true;
    }

    // Redact secrets
    SECRET_PATTERNS.forEach((pattern) => {
        if (pattern.test(content)) {
            content = content.replace(pattern, '[REDACTED_SECRET]');
            redacted = true;
        }
    });

    if (redacted) {
        console.warn('⚠️  Secrets detected and redacted from diff');
    }

    return {
        content,
        truncated,
        redacted,
    };
}
