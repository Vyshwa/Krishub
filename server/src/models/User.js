const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
