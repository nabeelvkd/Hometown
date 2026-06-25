export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: { message: string; details?: unknown };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface District {
  _id: string;
  name: string;
  nameMl?: string;
  state: string;
  code?: string;
  isActive: boolean;
}

export interface Block {
  _id: string;
  name: string;
  nameMl?: string;
  district: string | District;
  type: string;
  isActive: boolean;
}

export interface Village {
  _id: string;
  name: string;
  nameMl?: string;
  block: string | Block;
  district: string | District;
  isActive: boolean;
}

export interface Business {
  _id: string;
  name: string;
  nameMl?: string;
  category: string;
  phone: string;
  whatsapp?: string;
  acceptsOrders?: boolean;
  address: string;
  photos?: string[];
  workingHours?: string;
  district: string;
  block: string;
  village: string;
  description?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
}

export interface ServiceProvider {
  _id: string;
  name: string;
  nameMl?: string;
  category: string;
  phone: string;
  whatsapp?: string;
  photo?: string;
  experienceYears: number;
  description?: string;
  district: string;
  block: string;
  village: string;
  isVerified: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  nameMl?: string;
  type: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  district: string;
  block: string;
  village: string;
  order: number;
  isActive: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  titleMl?: string;
  body: string;
  bodyMl?: string;
  type: string;
  district: string;
  block: string;
  village: string;
  isPinned: boolean;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  preferredLanguage: string;
  district?: string;
  block?: string;
  village?: string;
}

export interface Taxi {
  _id: string;
  driverName: string;
  photo?: string;
  phone: string;
  whatsapp?: string;
  vehicleType: string;
  vehicleNumber: string;
  seats?: number;
  available?: boolean;
  description?: string;
  district: string;
  block: string;
  village: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface BusTrip {
  _id: string;
  destination: string;
  time: string;
  operator: string;
  number: string;
  tags: string[];
  district: string;
  block: string;
  village: string;
  isActive: boolean;
}

export interface Ad {
  _id: string;
  title: string;
  subtitle?: string;
  cta?: string;
  ctaUrl?: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  village?: string | { _id: string; name: string };
  createdByRole?: string;
  createdBy?: string | { _id: string; name: string; role: string };
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  district?: string;
  block?: string;
  village?: string | { _id: string; name: string; nameMl?: string };
  isActive: boolean;
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  LOCAL_ADMIN: 'local_admin',
} as const;
