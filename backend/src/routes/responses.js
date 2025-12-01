const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

// Public route - submit form response (no auth required)
router.post('/:formId/submit', responseController.submitResponse);

// Get single response
router.get('/:responseId', responseController.getResponse);

module.exports = router;
