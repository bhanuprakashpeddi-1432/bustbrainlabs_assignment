const Response = require('../models/Response');
const crypto = require('crypto');

exports.handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-airtable-content-mac'];
      if (!signature) return res.status(401).json({ error: 'Missing webhook signature' });

      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('base64');

      if (signature !== expectedSignature) return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { payloads } = req.body;
    if (!payloads || !Array.isArray(payloads)) return res.status(400).json({ error: 'Invalid webhook payload' });

    for (const payload of payloads) {
      const { changedTablesById } = payload;
      if (!changedTablesById) continue;

      for (const [tableId, tableChanges] of Object.entries(changedTablesById)) {
        const { changedRecordsById, destroyedRecordIds } = tableChanges;

        if (changedRecordsById) {
          for (const [recordId, recordChanges] of Object.entries(changedRecordsById)) {
            await handleRecordUpdate(recordId, recordChanges);
          }
        }

        if (destroyedRecordIds && Array.isArray(destroyedRecordIds)) {
          for (const recordId of destroyedRecordIds) {
            await handleRecordDeletion(recordId);
          }
        }
      }
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

async function handleRecordUpdate(recordId, changes) {
  try {
    const response = await Response.findOne({ airtableRecordId: recordId });
    if (!response) return;

    response.status = 'synced';
    response.updatedAt = new Date();
    await response.save();
  } catch (error) {
    // Silent failure for background tasks
  }
}

async function handleRecordDeletion(recordId) {
  try {
    const response = await Response.findOne({ airtableRecordId: recordId });
    if (!response) return;

    response.status = 'deletedInAirtable';
    response.updatedAt = new Date();
    await response.save();
  } catch (error) {
    // Silent failure for background tasks
  }
}

exports.testWebhook = (req, res) => {
  res.json({ message: 'Webhook endpoint is active', timestamp: new Date().toISOString() });
};
