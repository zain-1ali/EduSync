import mongoose from 'mongoose';

const refreshSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    deviceName: { type: String, trim: true, maxlength: 160 },
    persistent: { type: Boolean, default: false },
    userAgent: { type: String, trim: true, maxlength: 500 },
    ipAddress: { type: String, trim: true, maxlength: 80 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    lastUsedAt: Date,
    revokedAt: Date,
    revokeReason: { type: String, trim: true, maxlength: 200 },
    replacedBySessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'RefreshSession' },
  },
  { timestamps: true }
);

refreshSessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

export const RefreshSession = mongoose.model('RefreshSession', refreshSessionSchema);
