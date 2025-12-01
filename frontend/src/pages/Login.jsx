import { authAPI } from '../services/api';

function Login({ onLogin }) {
    const handleLogin = () => {
        // Redirect to backend OAuth endpoint
        authAPI.initiateLogin();
    };

    return (
        <div className="page">
            <div className="container-sm">
                <div className="card" style={{ maxWidth: '500px', margin: '80px auto' }}>
                    <div className="card-header text-center">
                        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                            Airtable Form Builder
                        </p>
                    </div>

                    <div className="card-body text-center" style={{ padding: '40px 24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                                Create dynamic forms connected to your Airtable bases with conditional logic and real-time synchronization.
                            </p>
                        </div>

                        <button
                            onClick={handleLogin}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', maxWidth: '300px' }}
                        >
                            Login with Airtable
                        </button>

                        <p className="form-help" style={{ marginTop: '16px' }}>
                            You'll be redirected to Airtable to authorize this application
                        </p>
                    </div>
                </div>

                <div className="card" style={{ maxWidth: '500px', margin: '24px auto' }}>
                    <div className="card-header">Features</div>
                    <div className="card-body">
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                ✓ OAuth authentication with Airtable
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                ✓ Create forms from Airtable tables
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                ✓ Conditional logic for dynamic forms
                            </li>
                            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                ✓ Real-time webhook synchronization
                            </li>
                            <li style={{ padding: '8px 0' }}>
                                ✓ Response management and analytics
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
