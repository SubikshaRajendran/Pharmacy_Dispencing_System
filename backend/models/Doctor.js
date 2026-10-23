const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Format doc101, doc476
    name: { type: String, required: true, trim: true },
    qualification: { type: String, default: 'MBBS, MD' },
    specialization: { type: String, default: 'General Medicine' },
    hospitalName: { type: String, default: 'MediHeal Medical Center' },
    registrationNumber: { type: String, required: true },
    password: { type: String, required: true },
    verificationStatus: { type: String, enum: ['verified', 'pending', 'rejected'], default: 'verified' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    requiresPasswordReset: { type: Boolean, default: true }
  },
  { timestamps: true }
);

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
