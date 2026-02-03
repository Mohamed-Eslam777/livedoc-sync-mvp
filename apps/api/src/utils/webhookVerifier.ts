import crypto from 'crypto';

/**
 * Verifies GitHub webhook signature using HMAC SHA256
 * @param payload - Raw payload string
 * @param signature - X-Hub-Signature-256 header value
 * @param secret - Webhook secret
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    if (!signature.startsWith('sha256=')) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
