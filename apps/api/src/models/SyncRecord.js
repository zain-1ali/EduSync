import mongoose from 'mongoose';

const syncRecordSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    entityType: { type: String, required: true, maxlength: 80 },
    entityId: { type: String, required: true, maxlength: 120 },
    data: { type: mongoose.Schema.Types.Mixed },
    version: { type: Number, required: true, min: 1 },
    syncSequence: { type: Number, required: true, min: 1 },
    deletedAt: Date,
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, optimisticConcurrency: true }
);

syncRecordSchema.index({ tenantId: 1, entityType: 1, entityId: 1 }, { unique: true });
syncRecordSchema.index({ tenantId: 1, syncSequence: 1 }, { unique: true });

export const SyncRecord = mongoose.model('SyncRecord', syncRecordSchema);
