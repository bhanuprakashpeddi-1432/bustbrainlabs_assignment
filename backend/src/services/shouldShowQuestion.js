/**
 * Pure function to determine if a question should be shown based on conditional rules
 * 
 * @param {Object|null} rules - Conditional rules object
 * @param {string} rules.logic - Logic operator: "AND" or "OR"
 * @param {Array} rules.conditions - Array of condition objects
 * @param {Object} answersSoFar - Current form answers as key-value pairs
 * @returns {boolean} - True if question should be shown, false otherwise
 * 
 * Condition structure:
 * {
 *   questionKey: string,
 *   operator: "equals" | "notEquals" | "contains",
 *   value: any
 * }
 */
function shouldShowQuestion(rules, answersSoFar) {
  // If no rules, always show the question
  if (!rules || !rules.conditions || rules.conditions.length === 0) {
    return true;
  }

  const { logic = 'AND', conditions } = rules;

  // Evaluate each condition
  const evaluateCondition = (condition) => {
    const { questionKey, operator, value } = condition;

    // Get the answer for this question
    const answer = answersSoFar[questionKey];

    // Handle missing/undefined answers
    if (answer === undefined || answer === null) {
      // For "notEquals", missing value means condition is true
      if (operator === 'notEquals') {
        return true;
      }
      // For other operators, missing value means condition is false
      return false;
    }

    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        // Handle array comparison (for multi-select)
        if (Array.isArray(answer)) {
          return Array.isArray(value) 
            ? JSON.stringify(answer.sort()) === JSON.stringify(value.sort())
            : answer.includes(value);
        }
        // Handle string comparison (case-insensitive)
        if (typeof answer === 'string' && typeof value === 'string') {
          return answer.toLowerCase() === value.toLowerCase();
        }
        // Default equality
        return answer === value;

      case 'notEquals':
        // Handle array comparison
        if (Array.isArray(answer)) {
          return Array.isArray(value)
            ? JSON.stringify(answer.sort()) !== JSON.stringify(value.sort())
            : !answer.includes(value);
        }
        // Handle string comparison (case-insensitive)
        if (typeof answer === 'string' && typeof value === 'string') {
          return answer.toLowerCase() !== value.toLowerCase();
        }
        // Default inequality
        return answer !== value;

      case 'contains':
        // Handle array (multi-select) - check if answer array contains the value
        if (Array.isArray(answer)) {
          return answer.some(item => {
            if (typeof item === 'string' && typeof value === 'string') {
              return item.toLowerCase().includes(value.toLowerCase());
            }
            return item === value;
          });
        }
        // Handle string - check if answer contains the value
        if (typeof answer === 'string' && typeof value === 'string') {
          return answer.toLowerCase().includes(value.toLowerCase());
        }
        // For other types, fallback to equality
        return answer === value;

      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  };

  // Evaluate all conditions
  const results = conditions.map(evaluateCondition);

  // Combine results based on logic operator
  if (logic === 'AND') {
    return results.every(result => result === true);
  } else if (logic === 'OR') {
    return results.some(result => result === true);
  }

  // Default to false if logic is invalid
  return false;
}

module.exports = shouldShowQuestion;
