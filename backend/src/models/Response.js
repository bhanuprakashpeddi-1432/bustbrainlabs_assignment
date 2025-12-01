const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  airtableRecordId: { type: String },
  answers: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['synced','pending','deletedInAirtable'], default: 'synced' }
}, { timestamps: true });

module.exports = mongoose.model('Response', ResponseSchema);
