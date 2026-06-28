/**
 * Resets the database to a clean state: wipes ALL collections and seeds only
 * the super admin account. Everything else (districts, villages, content) is
 * created later through the admin console.
 *
 * Usage: npm run seed
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  District,
  Block,
  Village,
  Category,
  Business,
  ServiceProvider,
  Taxi,
  BusTrip,
  HomeCategory,
  CategoryEntry,
  EmergencyContact,
  Announcement,
  Ad,
  AppUpdate,
  AppDevice,
  User,
  Favorite,
  Review,
  Report,
} from '../models';
import { USER_ROLES } from '../constants';

const SUPER_ADMIN = {
  name: 'Super Admin',
  phone: '+919496085317',
  password: 'Nabeel@Nabnhara#12',
};

async function seed(): Promise<void> {
  await connectDB();

  // eslint-disable-next-line no-console
  console.log('[seed] Wiping all collections...');
  await Promise.all([
    District.deleteMany({}),
    Block.deleteMany({}),
    Village.deleteMany({}),
    Category.deleteMany({}),
    Business.deleteMany({}),
    ServiceProvider.deleteMany({}),
    Taxi.deleteMany({}),
    BusTrip.deleteMany({}),
    HomeCategory.deleteMany({}),
    CategoryEntry.deleteMany({}),
    EmergencyContact.deleteMany({}),
    Announcement.deleteMany({}),
    Ad.deleteMany({}),
    AppUpdate.deleteMany({}),
    AppDevice.deleteMany({}),
    User.deleteMany({}),
    Favorite.deleteMany({}),
    Review.deleteMany({}),
    Report.deleteMany({}),
  ]);

  // --- Super Admin (the only seeded account) ---
  const admin = new User({
    name: SUPER_ADMIN.name,
    phone: SUPER_ADMIN.phone,
    role: USER_ROLES.SUPER_ADMIN,
    preferredLanguage: 'en',
  });
  await admin.setPassword(SUPER_ADMIN.password);
  await admin.save();

  // eslint-disable-next-line no-console
  console.log('[seed] Done. Database is empty except the super admin.');
  // eslint-disable-next-line no-console
  console.log(`[seed] Super admin -> ${SUPER_ADMIN.phone} / ${SUPER_ADMIN.password}`);

  await disconnectDB();
  await mongoose.connection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});
