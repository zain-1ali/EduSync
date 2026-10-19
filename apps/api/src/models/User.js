import mongoose from 'mongoose';
import { ACCESS_LEVELS } from '@school/contracts';

const permissionValues = Object.values(ACCESS_LEVELS);

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true,
      required() {
        return this.role !== 'super_admin';
      },
    },
    staffId: { type: String, trim: true, maxlength: 120, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: ['super_admin', 'school_admin', 'instructor', 'support_staff'],
      required: true,
      index: true,
    },
    permissions: {
      type: Map,
      of: {
        type: String,
        enum: permissionValues,
      },
      default: {},
    },
    status: {
      type: String,
      enum: ['pending_setup', 'active', 'locked', 'disabled'],
      default: 'pending_setup',
      index: true,
    },
    setupTokenHash: { type: String, select: false },
    setupTokenExpiresAt: { type: Date, select: false },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform(_doc, value) {
        delete value.passwordHash;
        delete value.setupTokenHash;
        delete value.setupTokenExpiresAt;
        delete value.resetTokenHash;
        delete value.resetTokenExpiresAt;
        return value;
      },
    },
  }
);

userSchema.index({ tenantId: 1, role: 1, status: 1 });
userSchema.index(
  { tenantId: 1, staffId: 1 },
  { unique: true, partialFilterExpression: { staffId: { $type: 'string' } } }
);

export const User = mongoose.model('User', userSchema);
