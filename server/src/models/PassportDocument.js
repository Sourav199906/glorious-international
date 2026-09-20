import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', index: true },
    storageKey: { type: String, required: true, unique: true },
    originalName: { type: String, required: true, maxlength: 180 },
    mimeType: { type: String, enum: ['application/pdf'], default: 'application/pdf' },
    size: { type: Number, required: true, max: 0 },
    status: { type: String, enum: ['TEMP', 'RESERVED', 'CLAIMED'], default: 'TEMP', index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('PassportDocument', schema);
