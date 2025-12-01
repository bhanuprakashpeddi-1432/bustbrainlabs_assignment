const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);

// Get current user
router.get('/me', authMiddleware, authController.getMe);

// Airtable API Key authentication (simpler alternative)
router.get('/airtable/apikey', authController.airtableApiKeyAuth);

// Airtable OAuth routes
router.get('/airtable', authController.airtableAuth);
router.get('/airtable/callback', authController.airtableCallback);

module.exports = router;
