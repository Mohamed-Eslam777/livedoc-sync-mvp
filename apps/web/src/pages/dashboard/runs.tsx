import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Runs() {
    const { status } = useSession();
    const router = useRouter();
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        fetchRuns();
    }, []);

    async function fetchRuns() {
        try {
            const response = await fetch('/api/runs');
            const data = await response.json();
            setRuns(data);
        } catch (error) {
            console.error('Failed to fetch runs:', error);
        } finally {
            setLoading(false);
        }
    }

    if (status === 'loading' || loading) {
        return <div className="container">Loading...</div>;
    }

    function getBadgeClass(status: string) {
        switch (status) {
            case 'success':
                return 'badge-success';
            case 'fail':
                return 'badge-fail';
            case 'running':
                return 'badge-running';
            case 'queued':
                return 'badge-queued';
            default:
                return '';
        }
    }

    function getConfidenceEmoji(confidence: string | null) {
        if (!confidence) return '';
        switch (confidence) {
            case 'high':
                return '🟢';
            case 'medium':
                return '🟡';
            case 'low':
                return '🔴';
            default:
                return '';
        }
    }

    return (
        <div className="container">
            <div className="header">
                <h1>🏃 Runs History</h1>
                <div className="nav">
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/dashboard/repos">Repositories</Link>
                    <Link href="/dashboard/runs">Runs</Link>
                    <Link href="/api/auth/signout">Sign Out</Link>
                </div>
            </div>

            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Last 20 documentation analysis runs across all repositories.
            </p>

            {runs.length === 0 ? (
                <div className="card">
                    <p>No runs yet. Open a PR on an installed repository to trigger analysis.</p>
                </div>
            ) : (
                runs.map((run) => (
                    <div className="card" key={run.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>
                                    PR #{run.prNumber}: {run.prTitle || 'Untitled PR'}
                                </h3>
                                <a href={run.prUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', fontSize: '0.875rem' }}>
                                    View PR →
                                </a>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {run.confidence && (
                                    <span style={{ fontSize: '1.25rem' }} title={`Confidence: ${run.confidence}`}>
                                        {getConfidenceEmoji(run.confidence)}
                                    </span>
                                )}
                                <span className={`badge ${getBadgeClass(run.status)}`}>
                                    {run.status}
                                </span>
                            </div>
                        </div>

                        {run.summaryMarkdown && (
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '5px', marginTop: '1rem' }}>
                                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Summary:</strong>
                                <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                                    {run.summaryMarkdown.substring(0, 200)}
                                    {run.summaryMarkdown.length > 200 && '...'}
                                </div>
                            </div>
                        )}

                        {run.errorMessage && (
                            <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '5px', marginTop: '1rem' }}>
                                <strong style={{ color: '#721c24', display: 'block', marginBottom: '0.5rem' }}>Error:</strong>
                                <div style={{ fontSize: '0.875rem', color: '#721c24' }}>
                                    {run.errorMessage}
                                </div>
                            </div>
                        )}

                        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1rem' }}>
                            {new Date(run.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}
