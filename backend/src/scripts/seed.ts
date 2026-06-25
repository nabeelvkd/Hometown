/**
 * Seeds the database with sample Kerala data so the API is immediately
 * useful for development. Idempotent-ish: it wipes the seeded collections
 * first, so re-running gives a clean known state.
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
  EmergencyContact,
  Announcement,
  Ad,
  User,
} from '../models';
import { AD_STATUS } from '../models/Ad';
import { CATEGORY_KINDS } from '../models/Category';
import {
  BUSINESS_CATEGORIES,
  SERVICE_CATEGORIES,
  EMERGENCY_TYPES,
  ANNOUNCEMENT_TYPES,
  BLOCK_TYPES,
  USER_ROLES,
} from '../constants';

async function seed(): Promise<void> {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log('[seed] Clearing existing data...');

  await Promise.all([
    District.deleteMany({}),
    Block.deleteMany({}),
    Village.deleteMany({}),
    Category.deleteMany({}),
    Business.deleteMany({}),
    ServiceProvider.deleteMany({}),
    Taxi.deleteMany({}),
    BusTrip.deleteMany({}),
    EmergencyContact.deleteMany({}),
    Announcement.deleteMany({}),
    Ad.deleteMany({}),
    User.deleteMany({}),
  ]);

  // --- Districts ---
  const [kozhikode, malappuram] = await District.create([
    { name: 'Kozhikode', nameMl: 'കോഴിക്കോട്', state: 'Kerala', code: 'KKD' },
    { name: 'Malappuram', nameMl: 'മലപ്പുറം', state: 'Kerala', code: 'MLP' },
  ]);

  // --- Blocks (State → District → Block) ---
  const [koduvally] = await Block.create([
    {
      name: 'Koduvally Block',
      nameMl: 'കൊടുവള്ളി ബ്ലോക്ക്',
      district: kozhikode._id,
      type: BLOCK_TYPES.BLOCK,
    },
  ]);

  // --- Villages (Block → Village / Town) ---
  const [omassery, kodenchery, mukkam] = await Village.create([
    {
      name: 'Omassery',
      nameMl: 'ഓമശ്ശേരി',
      heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=70',
      block: koduvally._id,
      district: kozhikode._id,
    },
    {
      name: 'Kodenchery',
      nameMl: 'കോടഞ്ചേരി',
      block: koduvally._id,
      district: kozhikode._id,
    },
    {
      name: 'Mukkam',
      nameMl: 'മുക്കം',
      block: koduvally._id,
      district: kozhikode._id,
    },
  ]);

  // Content for the primary demo village.
  const village = omassery;
  const loc = { district: kozhikode._id, block: koduvally._id, village: village._id };

  // --- Categories ---
  await Category.create([
    { key: BUSINESS_CATEGORIES.GROCERY, name: 'Grocery', nameMl: 'പലവ്യഞ്ജനം', kind: CATEGORY_KINDS.BUSINESS, order: 1 },
    { key: BUSINESS_CATEGORIES.BAKERY, name: 'Bakery', nameMl: 'ബേക്കറി', kind: CATEGORY_KINDS.BUSINESS, order: 2 },
    { key: BUSINESS_CATEGORIES.MEDICAL_STORE, name: 'Medical Store', nameMl: 'മെഡിക്കൽ സ്റ്റോർ', kind: CATEGORY_KINDS.BUSINESS, order: 3 },
    { key: BUSINESS_CATEGORIES.RESTAURANT, name: 'Restaurant', nameMl: 'റെസ്റ്റോറന്റ്', kind: CATEGORY_KINDS.BUSINESS, order: 4 },
    { key: BUSINESS_CATEGORIES.HARDWARE, name: 'Hardware', nameMl: 'ഹാർഡ്‌വെയർ', kind: CATEGORY_KINDS.BUSINESS, order: 5 },
    { key: BUSINESS_CATEGORIES.SUPERMARKET, name: 'Supermarket', nameMl: 'സൂപ്പർമാർക്കറ്റ്', kind: CATEGORY_KINDS.BUSINESS, order: 6 },
    { key: SERVICE_CATEGORIES.ELECTRICIAN, name: 'Electrician', nameMl: 'ഇലക്ട്രീഷ്യൻ', kind: CATEGORY_KINDS.SERVICE, order: 1 },
    { key: SERVICE_CATEGORIES.PLUMBER, name: 'Plumber', nameMl: 'പ്ലംബർ', kind: CATEGORY_KINDS.SERVICE, order: 2 },
    { key: SERVICE_CATEGORIES.CARPENTER, name: 'Carpenter', nameMl: 'ആശാരി', kind: CATEGORY_KINDS.SERVICE, order: 3 },
    { key: SERVICE_CATEGORIES.PAINTER, name: 'Painter', nameMl: 'പെയിന്റർ', kind: CATEGORY_KINDS.SERVICE, order: 4 },
    { key: SERVICE_CATEGORIES.AC_TECHNICIAN, name: 'AC Technician', nameMl: 'എസി ടെക്നീഷ്യൻ', kind: CATEGORY_KINDS.SERVICE, order: 5 },
    { key: SERVICE_CATEGORIES.CLEANING, name: 'Cleaning Services', nameMl: 'ക്ലീനിംഗ്', kind: CATEGORY_KINDS.SERVICE, order: 6 },
  ]);

  // --- Businesses (Omassery) ---
  await Business.create([
    {
      name: 'Salkara Supermarket',
      nameMl: 'സൽകര സൂപ്പർമാർക്കറ്റ്',
      category: BUSINESS_CATEGORIES.SUPERMARKET,
      phone: '+919447012345',
      whatsapp: '+919447012345',
      acceptsOrders: true,
      address: 'Main Road, Omassery',
      workingHours: 'Mon–Sat 9:00 AM – 8:30 PM',
      photos: [
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=70',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=70',
      ],
      location: { type: 'Point', coordinates: [75.9131, 11.3801] },
      ...loc,
      isVerified: true,
      isFeatured: true,
      ratingAverage: 4.5,
      ratingCount: 32,
    },
    {
      name: 'Nelliparambil Bakery',
      nameMl: 'നെല്ലിപറമ്പിൽ ബേക്കറി',
      category: BUSINESS_CATEGORIES.BAKERY,
      phone: '+919447023456',
      address: 'Bus Stand Road, Omassery',
      ...loc,
      isVerified: true,
      isFeatured: true,
      ratingAverage: 4.2,
      ratingCount: 18,
    },
    {
      name: 'Omassery Medicals',
      category: BUSINESS_CATEGORIES.MEDICAL_STORE,
      phone: '+919447034567',
      address: 'Near Bus Stand, Omassery',
      ...loc,
      isVerified: true,
      isFeatured: false,
      ratingAverage: 4.0,
      ratingCount: 9,
    },
  ]);

  // --- Service Providers (Omassery) ---
  await ServiceProvider.create([
    {
      name: 'Rasheed Electrician',
      category: SERVICE_CATEGORIES.ELECTRICIAN,
      phone: '+919447045678',
      whatsapp: '+919447045678',
      photo: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&q=70',
      experienceYears: 12,
      ...loc,
      isVerified: true,
      ratingAverage: 4.6,
      ratingCount: 24,
    },
    {
      name: 'Suresh Plumbing Works',
      category: SERVICE_CATEGORIES.PLUMBER,
      phone: '+919447056789',
      experienceYears: 8,
      ...loc,
      isVerified: true,
      ratingAverage: 4.3,
      ratingCount: 15,
    },
  ]);

  // --- Taxis / Drivers (Omassery) ---
  await Taxi.create([
    {
      driverName: 'Saji',
      photo: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=70',
      phone: '+919447090001',
      whatsapp: '+919447090001',
      vehicleType: 'auto',
      vehicleNumber: 'KL11AB1234',
      seats: 3,
      ...loc,
      isVerified: true,
      ratingAverage: 4.7,
      ratingCount: 31,
    },
    {
      driverName: 'Manoj',
      photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=70',
      phone: '+919447090002',
      whatsapp: '+919447090002',
      vehicleType: 'car',
      vehicleNumber: 'KL11Cd5678',
      seats: 4,
      description: 'Airport & outstation trips. AC sedan.',
      ...loc,
      isVerified: true,
      ratingAverage: 4.8,
      ratingCount: 52,
    },
  ]);

  // --- Bus Trips (Omassery -> Kozhikode) ---
  const busBase = [
    { time: '05:50', operator: 'KSRTC Ordinary', number: 'KL-15-A-2230', tags: ['ksrtc', 'ordinary'] },
    { time: '06:15', operator: 'KSRTC Fast Passenger', number: 'KL-15-A-1234', tags: ['ksrtc', 'fast'] },
    { time: '06:35', operator: 'City Bus', number: 'KL-11-A-5678', tags: ['private'] },
    { time: '07:00', operator: 'A1 Travels', number: 'KL-10-BC-4321', tags: ['private'] },
    { time: '07:30', operator: 'City Bus', number: 'KL-11-A-8765', tags: ['private'] },
    { time: '08:00', operator: 'KSRTC Ordinary', number: 'KL-15-A-2233', tags: ['ksrtc', 'ordinary'] },
    { time: '08:45', operator: 'Malabar Express', number: 'KL-07-CC-7788', tags: ['private', 'fast'] },
    { time: '09:30', operator: 'Jaihind Travels', number: 'KL-11-BB-3344', tags: ['private'] },
    { time: '10:15', operator: 'KSRTC Fast Passenger', number: 'KL-15-A-1290', tags: ['ksrtc', 'fast'] },
    { time: '12:30', operator: 'KSRTC Ordinary', number: 'KL-15-A-3344', tags: ['ksrtc', 'ordinary'] },
    { time: '15:30', operator: 'KSRTC Fast Passenger', number: 'KL-15-A-1888', tags: ['ksrtc', 'fast'] },
    { time: '18:30', operator: 'Malabar Express', number: 'KL-07-CC-9090', tags: ['private', 'fast'] },
    { time: '20:00', operator: 'KSRTC Ordinary', number: 'KL-15-A-4455', tags: ['ksrtc', 'ordinary'] },
  ];
  await BusTrip.create([
    ...busBase.map((b) => ({ ...b, destination: 'Kozhikode', ...loc })),
    ...busBase
      .filter((_, i) => i % 2 === 0)
      .map((b) => ({ ...b, destination: 'Kunnamangalam', ...loc })),
  ]);

  // A distinct schedule for a second village, so bus times differ per village.
  const kodLoc = { district: kozhikode._id, block: koduvally._id, village: kodenchery._id };
  const kodBase = [
    { time: '06:00', operator: 'KSRTC Ordinary', number: 'KL-15-B-3001', tags: ['ksrtc', 'ordinary'] },
    { time: '07:10', operator: 'City Bus', number: 'KL-11-D-4400', tags: ['private'] },
    { time: '08:20', operator: 'KSRTC Fast Passenger', number: 'KL-15-B-3050', tags: ['ksrtc', 'fast'] },
    { time: '09:45', operator: 'Lakeland Travels', number: 'KL-10-E-7700', tags: ['private'] },
    { time: '13:00', operator: 'KSRTC Ordinary', number: 'KL-15-B-3120', tags: ['ksrtc', 'ordinary'] },
    { time: '16:15', operator: 'City Bus', number: 'KL-11-D-4422', tags: ['private'] },
    { time: '19:00', operator: 'KSRTC Fast Passenger', number: 'KL-15-B-3200', tags: ['ksrtc', 'fast'] },
  ];
  await BusTrip.create(kodBase.map((b) => ({ ...b, destination: 'Kozhikode', ...kodLoc })));

  // --- Emergency Contacts (Omassery) ---
  await EmergencyContact.create([
    { name: 'Koduvally Police Station', type: EMERGENCY_TYPES.POLICE, phone: '04952210100', alternatePhone: '100', ...loc, order: 1 },
    { name: 'Omassery PHC', type: EMERGENCY_TYPES.HOSPITAL, phone: '04952210200', ...loc, order: 2 },
    { name: 'Ambulance (108)', type: EMERGENCY_TYPES.AMBULANCE, phone: '108', ...loc, order: 3 },
    { name: 'Fire Force', type: EMERGENCY_TYPES.FIRE_FORCE, phone: '101', ...loc, order: 4 },
    { name: 'Blood Bank Kozhikode', type: EMERGENCY_TYPES.BLOOD_BANK, phone: '04952723000', ...loc, order: 5 },
  ]);

  // --- Announcements (Omassery) ---
  await Announcement.create([
    {
      title: 'Scheduled power shutdown',
      titleMl: 'വൈദ്യുതി മുടക്കം',
      body: 'Power will be unavailable from 9 AM to 1 PM on Sunday for line maintenance.',
      type: ANNOUNCEMENT_TYPES.POWER_SHUTDOWN,
      ...loc,
      isPinned: true,
    },
    {
      title: 'Free health camp',
      titleMl: 'സൗജന്യ ആരോഗ്യ ക്യാമ്പ്',
      body: 'A free general health checkup camp will be held at the panchayat hall this Saturday.',
      type: ANNOUNCEMENT_TYPES.HEALTH_CAMP,
      ...loc,
    },
  ]);

  // --- Ads (Omassery) ---
  await Ad.create([
    {
      title: 'Grow your business',
      subtitle: 'Advertise here and reach thousands in your locality.',
      cta: 'Learn More',
      status: AD_STATUS.APPROVED,
      isActive: true,
      ...loc,
    },
    {
      title: 'Salkara Supermarket — Onam offers',
      subtitle: 'Up to 30% off this week. Free home delivery.',
      cta: 'View',
      status: AD_STATUS.APPROVED,
      isActive: true,
      ...loc,
    },
  ]);

  // --- Super Admin ---
  const admin = new User({
    name: 'Super Admin',
    phone: '+919999999999',
    email: 'admin@nattile.app',
    role: USER_ROLES.SUPER_ADMIN,
    district: kozhikode._id,
    preferredLanguage: 'ml',
  });
  await admin.setPassword('admin123');
  await admin.save();

  // --- Local Admin for Omassery (one admin per village) ---
  const localAdmin = new User({
    name: 'Omassery Admin',
    phone: '+919888888888',
    email: 'omassery@nattile.app',
    role: USER_ROLES.LOCAL_ADMIN,
    district: kozhikode._id,
    block: koduvally._id,
    village: omassery._id,
    preferredLanguage: 'ml',
  });
  await localAdmin.setPassword('local123');
  await localAdmin.save();

  // eslint-disable-next-line no-console
  console.log('[seed] Done.');
  // eslint-disable-next-line no-console
  console.log('[seed] Super admin -> +919999999999 / admin123');
  // eslint-disable-next-line no-console
  console.log('[seed] Local admin (Omassery) -> +919888888888 / local123');
  // eslint-disable-next-line no-console
  console.log(`[seed] District (Kozhikode): ${kozhikode._id}`);
  // eslint-disable-next-line no-console
  console.log(`[seed] Block (Koduvally):    ${koduvally._id}`);
  // eslint-disable-next-line no-console
  console.log(`[seed] Village (Omassery):   ${omassery._id}`);
  // Reference unused seed entities so noUnusedLocals stays satisfied.
  void malappuram;
  void kodenchery;
  void mukkam;

  await disconnectDB();
  await mongoose.connection.close();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});
