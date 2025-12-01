import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import ResponsesList from './pages/ResponsesList';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Header user={user} onLogout={handleLogout} />

                <Routes>
                    <Route
                        path="/login"
                        element={
                            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
                        }
                    />

                    <Route
                        path="/auth-callback"
                        element={<AuthCallback onLogin={handleLogin} />}
                    />

                    <Route
                        path="/dashboard"
                        element={
                            user ? <Dashboard user={user} /> : <Navigate to="/login" />
                        }
                    />

                    <Route
                        path="/forms/new"
                        element={
                            user ? <FormBuilder user={user} /> : <Navigate to="/login" />
                        }
                    />

                    <Route
                        path="/forms/:formId/edit"
                        element={
                            user ? <FormBuilder user={user} /> : <Navigate to="/login" />
                        }
                    />

                    <Route
                        path="/forms/:formId"
                        element={<FormViewer />}
                    />

                    <Route
                        path="/forms/:formId/responses"
                        element={
                            user ? <ResponsesList user={user} /> : <Navigate to="/login" />
                        }
                    />

                    <Route
                        path="/"
                        element={<Navigate to={user ? "/dashboard" : "/login"} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
