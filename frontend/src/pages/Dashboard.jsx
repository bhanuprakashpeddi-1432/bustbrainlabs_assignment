import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formsAPI } from '../services/api';

function Dashboard({ user }) {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadForms();
    }, []);

    const loadForms = async () => {
        try {
            setLoading(true);
            const data = await formsAPI.getForms();
            setForms(data.forms || []);
            setError(null);
        } catch (err) {
            console.error('Error loading forms:', err);
            setError('Failed to load forms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading your forms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="page-title">Dashboard</h1>
                            <p className="page-subtitle">
                                Welcome back, {user.profile?.email || 'User'}
                            </p>
                        </div>
                        <Link to="/forms/new" className="btn btn-primary">
                            + Create New Form
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {forms.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📝</div>
                            <h3 className="empty-state-title">No forms yet</h3>
                            <p className="empty-state-text">
                                Create your first form to get started with Airtable integration
                            </p>
                            <Link to="/forms/new" className="btn btn-primary">
                                Create Your First Form
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {forms.map((form) => (
                            <div key={form._id} className="card">
                                <div className="card-header">
                                    {form.title || 'Untitled Form'}
                                </div>
                                <div className="card-body">
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                                        {form.questions?.length || 0} questions
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        Created: {new Date(form.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="card-footer">
                                    <Link
                                        to={`/forms/${form._id}`}
                                        className="btn btn-secondary btn-sm"
                                        target="_blank"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/forms/${form._id}/responses`}
                                        className="btn btn-outline btn-sm"
                                    >
                                        Responses
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
