import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jti: { type: String, unique: true, index: true },
    tokenHash: { type: String, required: true },
    familyId: { type: String, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    replacedByJti: String,
    userAgent: String,
    ip: String,
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('RefreshSession', schema);
