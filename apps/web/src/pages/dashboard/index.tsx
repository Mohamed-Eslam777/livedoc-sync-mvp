import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="container">Loading...</div>;
    }

    if (!session) {
        return null;
    }

    const installUrl = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || '#';

    return (
        <div className="container">
            <div className="header">
                <h1>🤖 LiveDoc Sync Dashboard</h1>
                <div className="nav">
                    <Link href="/dashboard">Dashboard</Link>
                    <Link href="/dashboard/repos">Repositories</Link>
                    <Link href="/dashboard/runs">Runs</Link>
                    <Link href="/api/auth/signout">Sign Out</Link>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h2>Welcome, {session.user?.name || 'User'}!</h2>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Manage your GitHub App installation and view documentation sync runs.
                </p>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>📱 Install GitHub App</h3>
                <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                    To start using LiveDoc Sync, install the GitHub App on your repositories.
                </p>
                <a href={installUrl} target="_blank" rel="noopener noreferrer">
                    <button className="button">Install GitHub App</button>
                </a>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>🔍 Quick Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/dashboard/repos">
                        <div style={{ cursor: 'pointer', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
                            <strong>📂 View Repositories</strong>
                            <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                                See all auto-registered repositories from your installations
                            </p>
                        </div>
                    </Link>
                    <Link href="/dashboard/runs">
                        <div style={{ cursor: 'pointer', padding: '1rem', background: '#f8f9fa', borderRadius: '5px' }}>
                            <strong>🏃 View Runs</strong>
                            <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>
                                Check the history of all documentation analysis runs
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
