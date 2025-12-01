/**
 * Supported Airtable field types
 */
const SUPPORTED_TYPES = [
  'short_text',      // singleLineText
  'long_text',       // multilineText
  'single_select',   // singleSelect
  'multi_select',    // multipleSelects
  'attachment'       // multipleAttachments
];

/**
 * Map Airtable API field types to our internal types
 */
const AIRTABLE_TYPE_MAP = {
  'singleLineText': 'short_text',
  'multilineText': 'long_text',
  'singleSelect': 'single_select',
  'multipleSelects': 'multi_select',
  'multipleAttachments': 'attachment'
};

/**
 * Check if a field type is supported
 * @param {string} fieldType - Airtable field type or our internal type
 * @returns {boolean}
 */
function isSupportedType(fieldType) {
  // Check if it's already our internal type
  if (SUPPORTED_TYPES.includes(fieldType)) {
    return true;
  }
  // Check if it's an Airtable API type that we support
  return AIRTABLE_TYPE_MAP.hasOwnProperty(fieldType);
}

/**
 * Convert Airtable API field type to our internal type
 * @param {string} airtableType - Airtable field type from API
 * @returns {string|null} - Our internal type or null if unsupported
 */
function normalizeFieldType(airtableType) {
  if (SUPPORTED_TYPES.includes(airtableType)) {
    return airtableType;
  }
  return AIRTABLE_TYPE_MAP[airtableType] || null;
}

/**
 * Validate a field value against its type and constraints
 * @param {Object} field - Field definition
 * @param {any} value - Value to validate
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateFieldValue(field, value) {
  const { type, required, choices } = field;

  // Check required fields
  if (required) {
    if (value === undefined || value === null || value === '') {
      return { valid: false, error: `${field.label || field.questionKey} is required` };
    }
    // For arrays (multi-select), check if empty
    if (Array.isArray(value) && value.length === 0) {
      return { valid: false, error: `${field.label || field.questionKey} is required` };
    }
  }

  // If not required and empty, it's valid
  if (!required && (value === undefined || value === null || value === '')) {
    return { valid: true };
  }

  // Validate based on type
  switch (type) {
    case 'short_text':
    case 'long_text':
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.label || field.questionKey} must be a string` };
      }
      return { valid: true };

    case 'single_select':
      if (typeof value !== 'string') {
        return { valid: false, error: `${field.label || field.questionKey} must be a string` };
      }
      // Validate against choices if provided
      if (choices && choices.length > 0) {
        if (!choices.includes(value)) {
          return { 
            valid: false, 
            error: `${field.label || field.questionKey} must be one of: ${choices.join(', ')}` 
          };
        }
      }
      return { valid: true };

    case 'multi_select':
      if (!Array.isArray(value)) {
        return { valid: false, error: `${field.label || field.questionKey} must be an array` };
      }
      // Validate each item against choices if provided
      if (choices && choices.length > 0) {
        const invalidChoices = value.filter(v => !choices.includes(v));
        if (invalidChoices.length > 0) {
          return { 
            valid: false, 
            error: `${field.label || field.questionKey} contains invalid choices: ${invalidChoices.join(', ')}` 
          };
        }
      }
      return { valid: true };

    case 'attachment':
      // Attachments should be an array of file objects or URLs
      if (!Array.isArray(value)) {
        return { valid: false, error: `${field.label || field.questionKey} must be an array of attachments` };
      }
      // Each attachment should have a url
      const invalidAttachments = value.filter(att => !att.url);
      if (invalidAttachments.length > 0) {
        return { 
          valid: false, 
          error: `${field.label || field.questionKey} contains invalid attachments (missing url)` 
        };
      }
      return { valid: true };

    default:
      return { valid: false, error: `Unsupported field type: ${type}` };
  }
}

/**
 * Validate form submission data against form definition
 * @param {Object} formDefinition - Form schema with questions
 * @param {Object} answers - User's answers
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateFormSubmission(formDefinition, answers) {
  const errors = [];
  const { questions } = formDefinition;

  for (const question of questions) {
    const { questionKey } = question;
    const value = answers[questionKey];

    const validation = validateFieldValue(question, value);
    if (!validation.valid) {
      errors.push({
        field: questionKey,
        message: validation.error
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  SUPPORTED_TYPES,
  AIRTABLE_TYPE_MAP,
  isSupportedType,
  normalizeFieldType,
  validateFieldValue,
  validateFormSubmission
};
