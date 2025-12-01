require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const responseRoutes = require('./routes/responses');
const webhookRoutes = require('./routes/webhooks');

app.use('/auth', authRoutes);
app.use('/forms', formRoutes);
app.use('/responses', responseRoutes);
app.use('/webhooks', webhookRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
