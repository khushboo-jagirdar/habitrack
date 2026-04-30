import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.Mixed, required: true },
  buyerId: { type: mongoose.Schema.Types.Mixed, required: true },
  ownerId: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['buy', 'rent'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  paymentLast4: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
