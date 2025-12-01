import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formsAPI } from '../services/api';
import ConditionalEditor from '../components/ConditionalEditor';

const SUPPORTED_TYPES = [
    { value: 'short_text', label: 'Short Text', airtableType: 'singleLineText' },
    { value: 'long_text', label: 'Long Text', airtableType: 'multilineText' },
    { value: 'single_select', label: 'Single Select', airtableType: 'singleSelect' },
    { value: 'multi_select', label: 'Multi Select', airtableType: 'multipleSelects' },
    { value: 'attachment', label: 'Attachment', airtableType: 'multipleAttachments' },
];

function FormBuilder({ user }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form data
    const [bases, setBases] = useState([]);
    const [selectedBase, setSelectedBase] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [fields, setFields] = useState([]);
    const [formTitle, setFormTitle] = useState('');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        loadBases();
    }, []);

    const loadBases = async () => {
        try {
            setLoading(true);
            const data = await formsAPI.getBases();
            setBases(data.bases || []);
        } catch (err) {
            setError('Failed to load bases');
        } finally {
            setLoading(false);
        }
    };

    const handleBaseSelect = async (baseId) => {
        setSelectedBase(baseId);
        setSelectedTable('');
        setFields([]);

        try {
            setLoading(true);
            const data = await formsAPI.getBaseSchema(baseId);
            setTables(data.tables || []);
        } catch (err) {
            setError('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    const handleTableSelect = (tableId) => {
        setSelectedTable(tableId);
        const table = tables.find(t => t.id === tableId);
        if (table) {
            // Filter only supported field types
            const supportedFields = table.fields.filter(field => {
                return SUPPORTED_TYPES.some(st => st.airtableType === field.type);
            });
            setFields(supportedFields);
        }
    };

    const handleAddQuestion = (field) => {
        const type = SUPPORTED_TYPES.find(st => st.airtableType === field.type);
        if (!type) return;

        const newQuestion = {
            questionKey: field.name.toLowerCase().replace(/\s+/g, '_'),
            airtableFieldId: field.id,
            label: field.name,
            type: type.value,
            required: false,
            conditionalRules: null,
            choices: field.options?.choices?.map(c => c.name) || []
        };

        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formTitle.trim()) {
            setError('Please enter a form title');
            return;
        }

        if (questions.length === 0) {
            setError('Please add at least one question');
            return;
        }

        try {
            setLoading(true);
            await formsAPI.createForm({
                airtableBaseId: selectedBase,
                airtableTableId: selectedTable,
                title: formTitle,
                questions
            });
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to create form: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Create New Form</h1>
                    <p className="page-subtitle">Build a form connected to your Airtable base</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Step Indicator */}
                <div className="card mb-3">
                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: step >= 1 ? 'var(--secondary-color)' : 'var(--medium-gray)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                1
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: step === 1 ? '600' : '400' }}>
                                Select Base
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: step >= 2 ? 'var(--secondary-color)' : 'var(--medium-gray)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                2
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: step === 2 ? '600' : '400' }}>
                                Select Table
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: step >= 3 ? 'var(--secondary-color)' : 'var(--medium-gray)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px'
                            }}>
                                3
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: step === 3 ? '600' : '400' }}>
                                Configure Fields
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Select Base */}
                    {step === 1 && (
                        <div className="card">
                            <div className="card-header">Step 1: Select Airtable Base</div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center">
                                        <div className="spinner"></div>
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label className="form-label required">Base</label>
                                        <select
                                            className="form-select"
                                            value={selectedBase}
                                            onChange={(e) => handleBaseSelect(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Select a base --</option>
                                            {bases.map(base => (
                                                <option key={base.id} value={base.id}>
                                                    {base.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="card-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setStep(2)}
                                    disabled={!selectedBase}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Table */}
                    {step === 2 && (
                        <div className="card">
                            <div className="card-header">Step 2: Select Table</div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label className="form-label required">Table</label>
                                    <select
                                        className="form-select"
                                        value={selectedTable}
                                        onChange={(e) => handleTableSelect(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select a table --</option>
                                        {tables.map(table => (
                                            <option key={table.id} value={table.id}>
                                                {table.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setStep(1)}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setStep(3)}
                                    disabled={!selectedTable}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Configure Fields */}
                    {step === 3 && (
                        <>
                            <div className="card">
                                <div className="card-header">Step 3: Configure Form</div>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label required">Form Title</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formTitle}
                                            onChange={(e) => setFormTitle(e.target.value)}
                                            placeholder="e.g., Contact Form"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">Available Fields</div>
                                <div className="card-body">
                                    <p className="form-help mb-2">
                                        Click on a field to add it to your form. Only supported field types are shown.
                                    </p>
                                    <div className="grid grid-2">
                                        {fields.map(field => (
                                            <div
                                                key={field.id}
                                                className="card"
                                                style={{ cursor: 'pointer', padding: '12px' }}
                                                onClick={() => handleAddQuestion(field)}
                                            >
                                                <div style={{ fontWeight: '500' }}>{field.name}</div>
                                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                    {SUPPORTED_TYPES.find(st => st.airtableType === field.type)?.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {questions.length > 0 && (
                                <div className="card">
                                    <div className="card-header">Form Questions ({questions.length})</div>
                                    <div className="card-body">
                                        {questions.map((question, index) => (
                                            <div key={index} className="card mb-2" style={{ padding: '16px' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Question Label</label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={question.label}
                                                        onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={question.required}
                                                            onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                                                        />
                                                        Required field
                                                    </label>
                                                </div>

                                                <ConditionalEditor
                                                    question={question}
                                                    allQuestions={questions}
                                                    onChange={(rules) => handleQuestionChange(index, 'conditionalRules', rules)}
                                                />

                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm mt-2"
                                                    onClick={() => handleRemoveQuestion(index)}
                                                >
                                                    Remove Question
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="card">
                                <div className="card-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setStep(2)}
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={loading || questions.length === 0}
                                    >
                                        {loading ? 'Creating...' : 'Create Form'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default FormBuilder;
