import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'owner', 'agent', 'admin'], default: 'buyer' },
  isAdmin: { type: Boolean, default: false },
  avatar: { type: String, default: '' },
  savedProperties: [{ type: mongoose.Schema.Types.Mixed }],
  // Aadhaar fields
  aadhaarNumber: { type: String, default: '' },
  aadhaarVerified: { type: Boolean, default: false },
  aadhaarOtp: { type: String, default: '' },
  aadhaarOtpExpiry: { type: Date, default: null },
  aadhaarRefId: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', userSchema, 'Habitrack');
