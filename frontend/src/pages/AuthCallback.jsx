import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = ({ onLogin }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = searchParams.get('userId');

        if (!userId) {
            setError('No user ID found in URL');
            return;
        }

        const fetchUser = async () => {
            try {
                // Fetch user details using the ID
                // We use the x-user-id header which our backend middleware expects
                const response = await axios.get('http://localhost:3000/auth/me', {
                    headers: {
                        'x-user-id': userId
                    }
                });

                if (response.data.user) {
                    onLogin(response.data.user);
                    navigate('/dashboard');
                } else {
                    setError('Failed to fetch user details');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setError('Authentication failed. Please try again.');
            }
        };

        fetchUser();
    }, [searchParams, onLogin, navigate]);

    if (error) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Completing authentication...</p>
        </div>
    );
};

export default AuthCallback;
