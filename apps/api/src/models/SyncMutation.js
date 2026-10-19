import mongoose from 'mongoose';

const syncMutationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    mutationId: { type: String, required: true, maxlength: 120 },
    entityType: { type: String, required: true, maxlength: 80 },
    entityId: { type: String, required: true, maxlength: 120 },
    status: { type: String, enum: ['processing', 'completed'], required: true },
    result: { type: mongoose.Schema.Types.Mixed },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

syncMutationSchema.index({ tenantId: 1, mutationId: 1 }, { unique: true });

export const SyncMutation = mongoose.model('SyncMutation', syncMutationSchema);
