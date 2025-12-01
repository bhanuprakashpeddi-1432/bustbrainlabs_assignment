import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formsAPI } from '../services/api';

function ResponsesList({ user }) {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadForm();
        loadResponses();
    }, [formId, page]);

    const loadForm = async () => {
        try {
            const data = await formsAPI.getForm(formId);
            setForm(data.form);
        } catch (err) {
            setError('Failed to load form');
        }
    };

    const loadResponses = async () => {
        try {
            setLoading(true);
            const data = await formsAPI.getResponses(formId, page);
            setResponses(data.responses || []);
            setPagination(data.pagination);
        } catch (err) {
            setError('Failed to load responses');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            synced: 'badge-success',
            pending: 'badge-warning',
            deletedInAirtable: 'badge-danger'
        };
        return badges[status] || 'badge';
    };

    if (loading && !responses.length) {
        return (
            <div className="page">
                <div className="container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading responses...</p>
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
                            <h1 className="page-title">Responses</h1>
                            <p className="page-subtitle">
                                {form?.title || 'Form'} - {pagination?.total || 0} total responses
                            </p>
                        </div>
                        <div>
                            <Link to="/dashboard" className="btn btn-secondary">
                                ← Back to Dashboard
                            </Link>
                            <Link
                                to={`/forms/${formId}`}
                                className="btn btn-outline"
                                target="_blank"
                                style={{ marginLeft: '8px' }}
                            >
                                View Form
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {responses.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <h3 className="empty-state-title">No responses yet</h3>
                            <p className="empty-state-text">
                                Share your form to start collecting responses
                            </p>
                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--light-gray)', borderRadius: '4px' }}>
                                <p style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
                                    Form URL:
                                </p>
                                <code style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                                    {window.location.origin}/forms/{formId}
                                </code>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Submitted</th>
                                        <th>Status</th>
                                        <th>Answers</th>
                                        <th>Airtable Record</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((response) => (
                                        <tr key={response.id}>
                                            <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {response.id.substring(0, 8)}...
                                            </td>
                                            <td>
                                                {new Date(response.createdAt).toLocaleString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(response.status)}`}>
                                                    {response.status}
                                                </span>
                                            </td>
                                            <td>
                                                <details>
                                                    <summary style={{ cursor: 'pointer', color: 'var(--secondary-color)' }}>
                                                        View answers
                                                    </summary>
                                                    <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--light-gray)', borderRadius: '4px' }}>
                                                        {Object.entries(response.answers).map(([key, value]) => (
                                                            <div key={key} style={{ marginBottom: '4px', fontSize: '14px' }}>
                                                                <strong>{key}:</strong> {JSON.stringify(value)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </td>
                                            <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                                {response.airtableRecordId}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.pages > 1 && (
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                                    <div style={{ color: 'var(--text-secondary)' }}>
                                        Page {pagination.page} of {pagination.pages}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                        >
                                            ← Previous
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.pages}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ResponsesList;
