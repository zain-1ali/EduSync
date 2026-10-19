import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'closed'],
      default: 'active',
      index: true,
    },
    settings: {
      timezone: { type: String, default: 'UTC' },
      locale: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' },
    },
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, optimisticConcurrency: true }
);

export const Tenant = mongoose.model('Tenant', tenantSchema);
