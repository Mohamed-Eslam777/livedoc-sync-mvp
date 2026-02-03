import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="container">
            <div className="header">
                <h1>🤖 LiveDoc Sync</h1>
                {session && (
                    <div className="nav">
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/api/auth/signout">Sign Out</Link>
                    </div>
                )}
            </div>

            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    AI-Powered GitHub Documentation Sync
                </h2>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
                    Automatically analyze pull requests and keep your documentation in sync with code changes.
                </p>

                {!session ? (
                    <Link href="/api/auth/signin">
                        <button className="button" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
                            Sign in with GitHub
                        </button>
                    </Link>
                ) : (
                    <Link href="/dashboard">
                        <button className="button" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
                            Go to Dashboard →
                        </button>
                    </Link>
                )}

                <div style={{ marginTop: '3rem', textAlign: 'left', background: '#f8f9fa', padding: '2rem', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>✨ Features</h3>
                    <ul style={{ lineHeight: '1.8' }}>
                        <li>📝 AI-powered PR documentation analysis</li>
                        <li>🔍 Automatic change detection</li>
                        <li>💡 Intelligent docs suggestions</li>
                        <li>🔒 Secure GitHub App integration</li>
                        <li>⚡ Real-time webhook processing</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
