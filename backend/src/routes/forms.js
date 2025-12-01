const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const responseController = require('../controllers/responseController');
const authMiddleware = require('../middleware/auth');

// Airtable integration routes (Protected)
router.get('/bases', authMiddleware, formController.getUserBases);
router.get('/bases/:baseId/schema', authMiddleware, formController.getBaseSchema);

// Form management routes (Protected)
router.get('/', authMiddleware, formController.getForms);
router.post('/', authMiddleware, formController.createForm);
router.get('/:formId/responses', authMiddleware, responseController.getResponses);

// Public routes (no auth required) - MUST BE LAST to avoid capturing other routes
router.get('/:formId', formController.getForm);

module.exports = router;
