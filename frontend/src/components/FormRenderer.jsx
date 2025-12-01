import shouldShowQuestion from '../utils/shouldShowQuestion';

function FormRenderer({ questions, answers, onChange, errors = {} }) {

    const renderField = (question) => {
        const { questionKey, label, type, required, choices, conditionalRules } = question;
        const value = answers[questionKey] || '';
        const error = errors[questionKey];

        // Check if question should be shown
        if (!shouldShowQuestion(conditionalRules, answers)) {
            return null;
        }

        return (
            <div key={questionKey} className="form-group">
                <label className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>

                {type === 'short_text' && (
                    <input
                        type="text"
                        className="form-input"
                        value={value}
                        onChange={(e) => onChange(questionKey, e.target.value)}
                        required={required}
                    />
                )}

                {type === 'long_text' && (
                    <textarea
                        className="form-textarea"
                        value={value}
                        onChange={(e) => onChange(questionKey, e.target.value)}
                        required={required}
                    />
                )}

                {type === 'single_select' && (
                    <select
                        className="form-select"
                        value={value}
                        onChange={(e) => onChange(questionKey, e.target.value)}
                        required={required}
                    >
                        <option value="">-- Select an option --</option>
                        {choices?.map((choice) => (
                            <option key={choice} value={choice}>
                                {choice}
                            </option>
                        ))}
                    </select>
                )}

                {type === 'multi_select' && (
                    <div className="checkbox-group">
                        {choices?.map((choice) => (
                            <label key={choice} className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(value) && value.includes(choice)}
                                    onChange={(e) => {
                                        const currentValue = Array.isArray(value) ? value : [];
                                        const newValue = e.target.checked
                                            ? [...currentValue, choice]
                                            : currentValue.filter(v => v !== choice);
                                        onChange(questionKey, newValue);
                                    }}
                                />
                                {choice}
                            </label>
                        ))}
                    </div>
                )}

                {type === 'attachment' && (
                    <div>
                        <input
                            type="file"
                            className="form-input"
                            multiple
                            onChange={(e) => {
                                const files = Array.from(e.target.files);
                                // In a real app, you'd upload these files and get URLs
                                onChange(questionKey, files.map(f => ({ url: URL.createObjectURL(f), filename: f.name })));
                            }}
                        />
                        <p className="form-help">You can upload multiple files</p>
                    </div>
                )}

                {error && <div className="form-error">{error}</div>}
            </div>
        );
    };

    return (
        <div className="form-renderer">
            {questions.map(renderField)}
        </div>
    );
}

export default FormRenderer;
