import mongoose from 'mongoose';

const schoolApplicationSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true, trim: true, maxlength: 160 },
    address: { type: String, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    estimatedStudents: {
      type: String,
      enum: ['1-100', '101-500', '501-1000', '1000+'],
    },
    websiteUrl: { type: String, trim: true, maxlength: 300 },
    applicantName: { type: String, required: true, trim: true, maxlength: 120 },
    applicantDesignation: { type: String, required: true, trim: true, maxlength: 120 },
    applicantEmail: { type: String, required: true, trim: true, lowercase: true, index: true },
    applicantMobile: { type: String, required: true, trim: true, maxlength: 40 },
    additionalInfo: { type: String, trim: true, maxlength: 2_000 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected', 'changes_requested'],
      default: 'pending',
      index: true,
    },
    decisionReason: { type: String, trim: true, maxlength: 1_000 },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  },
  { timestamps: true }
);

schoolApplicationSchema.index(
  { applicantEmail: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

export const SchoolApplication = mongoose.model('SchoolApplication', schoolApplicationSchema);
