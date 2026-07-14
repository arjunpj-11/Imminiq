import { connectDB, disconnectDB } from '../config/database';
import { env } from '../config/env';
import { User } from '../infrastructure/database/models/user.model';
import { bcryptPasswordHasher } from '../modules/auth/infrastructure/services/bcrypt-password-hasher.service';

const readArgument = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
};

const email = readArgument('email')?.trim().toLowerCase();
const password = readArgument('password');

const run = async () => {
  if (env.NODE_ENV === 'production') {
    throw new Error('The test-admin seeder is disabled in production.');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('Pass a valid email using --email=...');
  }
  if (!password || password.length < 12) {
    throw new Error('Pass a password of at least 12 characters using --password=...');
  }

  await connectDB();
  const passwordHash = await bcryptPasswordHasher.hash(password);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.fullName = 'Imminiq Test Admin';
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    existing.status = 'active';
    existing.provider = 'local';
    existing.emailVerified = true;
    existing.phoneVerified = false;
    existing.verificationExpiresAt = null;
    existing.deletedAt = null;
    existing.onboardingCompleted = true;
    await existing.save();
    console.log(`Test admin updated: ${existing.id} (${email})`);
  } else {
    const user = await User.create({
      fullName: 'Imminiq Test Admin',
      username: `admin_${Date.now().toString(36)}`,
      email,
      passwordHash,
      role: 'admin',
      status: 'active',
      provider: 'local',
      emailVerified: true,
      phoneVerified: false,
      verificationExpiresAt: null,
      onboardingCompleted: true,
    });
    console.log(`Test admin created: ${user.id} (${email})`);
  }
};

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
