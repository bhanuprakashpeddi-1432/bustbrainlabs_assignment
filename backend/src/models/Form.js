const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ConditionSchema = new Schema({
  questionKey: String,
  operator: { type: String, enum: ['equals','notEquals','contains'] },
  value: Schema.Types.Mixed
}, { _id: false });

const ConditionalRulesSchema = new Schema({
  logic: { type: String, enum: ['AND','OR'], default: 'AND' },
  conditions: [ConditionSchema]
}, { _id: false });

const QuestionSchema = new Schema({
  questionKey: { type: String, required: true },
  airtableFieldId: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['short_text','long_text','single_select','multi_select','attachment'] },
  required: { type: Boolean, default: false },
  conditionalRules: { type: ConditionalRulesSchema, default: null },
  choices: [String]
}, { _id: false });

const FormSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  airtableBaseId: { type: String, required: true },
  airtableTableId: { type: String, required: true },
  title: { type: String },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);
