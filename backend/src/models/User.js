const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
  airtableUserId: { type: String, required: true, unique: true },
  profile: { type: Object },
  accessToken: { type: String },
  refreshToken: { type: String },
  loginAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
