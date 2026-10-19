import mongoose from 'mongoose';

const syncCounterSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
  },
  value: { type: Number, default: 0 },
});

export const SyncCounter = mongoose.model('SyncCounter', syncCounterSchema);

export async function nextSyncSequence(tenantId) {
  const counter = await SyncCounter.findOneAndUpdate(
    { tenantId },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return counter.value;
}
