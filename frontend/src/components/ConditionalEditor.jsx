import { useState } from 'react';

function ConditionalEditor({ question, allQuestions, onChange }) {
    const [rules, setRules] = useState(question.conditionalRules || null);

    const handleAddCondition = () => {
        const newRules = rules || { logic: 'AND', conditions: [] };
        newRules.conditions.push({
            questionKey: '',
            operator: 'equals',
            value: ''
        });
        setRules({ ...newRules });
        onChange(newRules);
    };

    const handleRemoveCondition = (index) => {
        const newRules = { ...rules };
        newRules.conditions.splice(index, 1);
        if (newRules.conditions.length === 0) {
            setRules(null);
            onChange(null);
        } else {
            setRules(newRules);
            onChange(newRules);
        }
    };

    const handleConditionChange = (index, field, value) => {
        const newRules = { ...rules };
        newRules.conditions[index][field] = value;
        setRules(newRules);
        onChange(newRules);
    };

    const handleLogicChange = (logic) => {
        const newRules = { ...rules, logic };
        setRules(newRules);
        onChange(newRules);
    };

    // Get available questions (excluding current question)
    const availableQuestions = allQuestions.filter(q => q.questionKey !== question.questionKey);

    return (
        <div className="conditional-editor">
            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Conditional Logic</label>
                <p className="form-help">Show this question only when certain conditions are met</p>
            </div>

            {rules && rules.conditions.length > 0 && (
                <>
                    <div className="form-group">
                        <label className="form-label">Logic Operator</label>
                        <select
                            className="form-select"
                            value={rules.logic}
                            onChange={(e) => handleLogicChange(e.target.value)}
                        >
                            <option value="AND">ALL conditions must be true (AND)</option>
                            <option value="OR">ANY condition must be true (OR)</option>
                        </select>
                    </div>

                    {rules.conditions.map((condition, index) => (
                        <div key={index} className="card" style={{ marginBottom: '12px', padding: '12px' }}>
                            <div className="grid grid-3" style={{ gap: '12px', marginBottom: '8px' }}>
                                <div>
                                    <label className="form-label">Question</label>
                                    <select
                                        className="form-select"
                                        value={condition.questionKey}
                                        onChange={(e) => handleConditionChange(index, 'questionKey', e.target.value)}
                                    >
                                        <option value="">Select question</option>
                                        {availableQuestions.map(q => (
                                            <option key={q.questionKey} value={q.questionKey}>
                                                {q.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Operator</label>
                                    <select
                                        className="form-select"
                                        value={condition.operator}
                                        onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                                    >
                                        <option value="equals">Equals</option>
                                        <option value="notEquals">Not Equals</option>
                                        <option value="contains">Contains</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Value</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={condition.value}
                                        onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                        placeholder="Enter value"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveCondition(index)}
                            >
                                Remove Condition
                            </button>
                        </div>
                    ))}
                </>
            )}

            <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleAddCondition}
            >
                + Add Condition
            </button>
        </div>
    );
}

export default ConditionalEditor;
