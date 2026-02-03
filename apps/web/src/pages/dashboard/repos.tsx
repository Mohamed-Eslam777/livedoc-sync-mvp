import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { prisma } from '@livedoc-sync/shared';

export default function Repos() {
    const { status } = useSession();
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        fetchRepos();
    }, []);

    async function fetchRepos() {
        try {
            const response = await fetch('/api/repos');
            const data = await response.json();
            setRepos(data);
        } catch (error) {
            console.error('Failed to fetch repos:', error);
        } finally {
            setLoading(false);
        }
    }

    if (status === 'loading' || loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div className="header">
                <h1>📂 Repositories</h1>
                <div className="nav">
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/dashboard/repos">Repositories</Link>
                    <Link href="/dashboard/runs">Runs</Link>
                    <Link href="/api/auth/signout">Sign Out</Link>
                </div>
            </div>

            <p style={{ marginBottom: '2rem', color: '#666' }}>
                All repositories are auto-registered when the first PR webhook is received.
            </p>

            {repos.length === 0 ? (
                <div className="card">
                    <p>No repositories registered yet. Create a PR on an installed repository to get started.</p>
                </div>
            ) : (
                repos.map((repo) => (
                    <div className="card" key={repo.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{repo.fullName}</h3>
                                <p style={{ color: '#666', fontSize: '0.875rem' }}>
                                    Owner: {repo.owner} • Name: {repo.name}
                                </p>
                            </div>
                            <span className={`badge ${repo.enabled ? 'badge-success' : 'badge-fail'}`}>
                                {repo.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
