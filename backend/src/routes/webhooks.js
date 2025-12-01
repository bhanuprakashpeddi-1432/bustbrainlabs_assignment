const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Airtable webhook handler
router.post('/airtable', webhookController.handleWebhook);

// Test endpoint
router.get('/airtable/test', webhookController.testWebhook);

module.exports = router;
