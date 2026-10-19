import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD;
const name = process.env.SUPER_ADMIN_NAME?.trim() || 'EduSync Platform Admin';

if (!email || !password || password.length < 12) {
  console.error(
    'Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (at least 12 characters) before seeding'
  );
  process.exit(1);
}

await connectDatabase();
try {
  const passwordHash = await bcrypt.hash(password, 12);
  const fields = {
    name,
    passwordHash,
    role: 'super_admin',
    status: 'active',
    passwordChangedAt: new Date(),
  };
  let user = await User.findOne({ email });
  if (user) {
    user.set({ ...fields, tenantId: undefined });
    await user.save();
  } else {
    user = await User.create({ email, ...fields });
  }
  console.log(`Super administrator ready: ${user.email}`);
} finally {
  await disconnectDatabase();
}
