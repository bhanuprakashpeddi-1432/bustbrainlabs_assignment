import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formsAPI, responsesAPI } from '../services/api';
import FormRenderer from '../components/FormRenderer';

function FormViewer() {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadForm();
    }, [formId]);

    const loadForm = async () => {
        try {
            setLoading(true);
            const data = await formsAPI.getForm(formId);
            setForm(data.form);
        } catch (err) {
            setError('Failed to load form');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionKey, value) => {
        setAnswers({
            ...answers,
            [questionKey]: value
        });
        // Clear error for this field
        if (errors[questionKey]) {
            const newErrors = { ...errors };
            delete newErrors[questionKey];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        form.questions.forEach(question => {
            if (question.required && !answers[question.questionKey]) {
                newErrors[question.questionKey] = `${question.label} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await responsesAPI.submitResponse(formId, answers);
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit form');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div className="spinner"></div>
                    <p className="loading-text">Loading form...</p>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="page">
                <div className="container">
                    <div className="alert alert-error">
                        Form not found
                    </div>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="page">
                <div className="container-sm">
                    <div className="card" style={{ maxWidth: '600px', margin: '80px auto' }}>
                        <div className="card-body text-center" style={{ padding: '60px 40px' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✓</div>
                            <h2 style={{ fontSize: '28px', marginBottom: '16px', color: 'var(--success-color)' }}>
                                Thank You!
                            </h2>
                            <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
                                Your response has been submitted successfully.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container-sm">
                <div className="card" style={{ maxWidth: '800px', margin: '40px auto' }}>
                    <div className="card-header">
                        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
                            {form.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            Please fill out all required fields
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-error mb-3">
                                    {error}
                                </div>
                            )}

                            <FormRenderer
                                questions={form.questions}
                                answers={answers}
                                onChange={handleAnswerChange}
                                errors={errors}
                            />
                        </div>

                        <div className="card-footer">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={submitting}
                                style={{ width: '100%' }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Form'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default FormViewer;
