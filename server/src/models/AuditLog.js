import mongoose from 'mongoose';
export default mongoose.model(
  'AuditLog',
  new mongoose.Schema(
    {
      actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      action: String,
      entity: String,
      entityId: String,
      meta: Object,
    },
    { timestamps: true },
  ),
);
