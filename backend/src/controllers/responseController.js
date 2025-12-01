const Form = require('../models/Form');
const Response = require('../models/Response');
const airtableService = require('../services/airtableService');
const { validateFormSubmission } = require('../utils/validateAirtableTypes');
const shouldShowQuestion = require('../services/shouldShowQuestion');

exports.submitResponse = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers object is required' });
    }

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const visibleAnswers = {};
    for (const question of form.questions) {
      if (shouldShowQuestion(question.conditionalRules, answers) && answers.hasOwnProperty(question.questionKey)) {
        visibleAnswers[question.questionKey] = answers[question.questionKey];
      }
    }

    const validation = validateFormSubmission(form, visibleAnswers);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: validation.errors });
    }

    const airtableFields = {};
    form.questions.forEach(q => {
      if (visibleAnswers.hasOwnProperty(q.questionKey)) {
        airtableFields[q.airtableFieldId] = visibleAnswers[q.questionKey];
      }
    });

    let airtableRecord;
    try {
      airtableRecord = await airtableService.createRecord(
        form.owner,
        form.airtableBaseId,
        form.airtableTableId,
        airtableFields
      );
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create Airtable record', details: err.message });
    }

    const response = await Response.create({
      formId: form._id,
      airtableRecordId: airtableRecord.id,
      answers: visibleAnswers,
      status: 'synced'
    });

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response: {
        id: response._id,
        airtableRecordId: response.airtableRecordId,
        createdAt: response.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit response' });
  }
};

exports.getResponses = async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (req.user && form.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const responses = await Response.find({ formId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Response.countDocuments({ formId });

    res.json({
      responses: responses.map(r => ({
        id: r._id,
        airtableRecordId: r.airtableRecordId,
        answers: r.answers,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
};

exports.getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.responseId).populate('formId');
    if (!response) return res.status(404).json({ error: 'Response not found' });

    res.json({
      response: {
        id: response._id,
        formId: response.formId._id,
        formTitle: response.formId.title,
        airtableRecordId: response.airtableRecordId,
        answers: response.answers,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch response' });
  }
};
