import { signIn } from 'next-auth/react';

export default function SignIn() {
    return (
        <div className="container">
            <div style={{ maxWidth: '400px', margin: '8rem auto', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '2rem' }}>🤖 LiveDoc Sync</h1>
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>Sign In</h2>
                    <button
                        onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
                        className="button"
                        style={{ width: '100%' }}
                    >
                        Continue with GitHub
                    </button>
                </div>
            </div>
        </div>
    );
}
