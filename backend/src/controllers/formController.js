const airtableService = require('../services/airtableService');
const Form = require('../models/Form');

exports.getForms = async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user.id });
    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
};

exports.createForm = async (req, res) => {
  try {
    const { airtableBaseId, airtableTableId, title, questions } = req.body;

    if (!airtableBaseId || !airtableTableId) {
      return res.status(400).json({ error: 'Base ID and Table ID are required' });
    }

    try {
      const baseSchema = await airtableService.fetchBaseSchema(req.user.id, airtableBaseId);
      if (!baseSchema.tables.some(t => t.id === airtableTableId)) {
        return res.status(400).json({ error: 'Table not found in the specified base' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid base or table ID' });
    }

    const form = await Form.create({
      owner: req.user.id,
      airtableBaseId,
      airtableTableId,
      title: title || 'Untitled Form',
      questions: questions || []
    });

    res.status(201).json({ success: true, form });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create form' });
  }
};

exports.getUserBases = async (req, res) => {
  try {
    const basesData = await airtableService.fetchBases(req.user.id);
    res.json(basesData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bases' });
  }
};

exports.getBaseSchema = async (req, res) => {
  try {
    const schema = await airtableService.fetchBaseSchema(req.user.id, req.params.baseId);
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch base schema' });
  }
};

exports.getForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    res.json({
      form: {
        id: form._id,
        title: form.title,
        questions: form.questions,
        airtableBaseId: form.airtableBaseId,
        airtableTableId: form.airtableTableId,
        createdAt: form.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch form' });
  }
};
