/**
 * Shared, app-wide constants. Per the coding guidelines we avoid
 * hardcoded category/role strings scattered across the codebase.
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  // One Local Admin per village/town manages all content in their locality.
  LOCAL_ADMIN: 'local_admin',
  BUSINESS_OWNER: 'business_owner',
  SERVICE_PROVIDER: 'service_provider',
  USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export const USER_ROLE_VALUES = Object.values(USER_ROLES);

export const BUSINESS_CATEGORIES = {
  GROCERY: 'grocery',
  BAKERY: 'bakery',
  MEDICAL_STORE: 'medical_store',
  RESTAURANT: 'restaurant',
  HARDWARE: 'hardware',
  SUPERMARKET: 'supermarket',
} as const;

export type BusinessCategory =
  (typeof BUSINESS_CATEGORIES)[keyof typeof BUSINESS_CATEGORIES];
export const BUSINESS_CATEGORY_VALUES = Object.values(BUSINESS_CATEGORIES);

export const SERVICE_CATEGORIES = {
  ELECTRICIAN: 'electrician',
  PLUMBER: 'plumber',
  CARPENTER: 'carpenter',
  PAINTER: 'painter',
  AC_TECHNICIAN: 'ac_technician',
  CLEANING: 'cleaning',
} as const;

export type ServiceCategory =
  (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];
export const SERVICE_CATEGORY_VALUES = Object.values(SERVICE_CATEGORIES);

export const EMERGENCY_TYPES = {
  POLICE: 'police',
  HOSPITAL: 'hospital',
  AMBULANCE: 'ambulance',
  FIRE_FORCE: 'fire_force',
  BLOOD_BANK: 'blood_bank',
} as const;

export type EmergencyType =
  (typeof EMERGENCY_TYPES)[keyof typeof EMERGENCY_TYPES];
export const EMERGENCY_TYPE_VALUES = Object.values(EMERGENCY_TYPES);

export const ANNOUNCEMENT_TYPES = {
  POWER_SHUTDOWN: 'power_shutdown',
  ROAD_CLOSURE: 'road_closure',
  HEALTH_CAMP: 'health_camp',
  MUNICIPALITY: 'municipality',
  GENERAL: 'general',
} as const;

export type AnnouncementType =
  (typeof ANNOUNCEMENT_TYPES)[keyof typeof ANNOUNCEMENT_TYPES];
export const ANNOUNCEMENT_TYPE_VALUES = Object.values(ANNOUNCEMENT_TYPES);

export const BLOCK_TYPES = {
  BLOCK: 'block',
  MUNICIPALITY: 'municipality',
  CORPORATION: 'corporation',
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];
export const BLOCK_TYPE_VALUES = Object.values(BLOCK_TYPES);

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
export const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);
