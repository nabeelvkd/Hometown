// Shared content types + structural constants for the Nattile app.
// All live content now comes from the backend (per selected village).

export interface ServiceSummary {
  key: string;
  label: string;
  experts: number;
  rating: number;
  icon: 'electrician' | 'plumber' | 'carpenter' | 'painter';
  tint: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  distance?: string;
  phone: string;
  whatsapp?: string;
  acceptsOrders: boolean;
  address: string;
  workingHours: string;
  description: string;
  photos: string[];
  lat?: number;
  lng?: number;
  verified: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  rating: number;
  reviews: number;
  experienceYears: number;
  phone: string;
  whatsapp?: string;
  photo: string;
  about: string;
  verified: boolean;
}

export interface Taxi {
  id: string;
  driverName: string;
  photo?: string;
  phone: string;
  whatsapp?: string;
  vehicleType: string;
  vehicleTypeLabel: string;
  vehicleNumber: string;
  seats?: number;
  available: boolean;
  rating: number;
  reviews: number;
  verified: boolean;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  time: string;
  createdAt?: string;
}

export interface BusTrip {
  id: string;
  time: string; // "HH:MM" 24-hour
  operator: string;
  number: string;
  tags: string[]; // e.g. ['ksrtc','fast']
  destination?: string;
}

export const BUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'ksrtc', label: 'KSRTC' },
  { key: 'private', label: 'Private' },
  { key: 'fast', label: 'Fast Passenger' },
  { key: 'ordinary', label: 'Ordinary' },
];

export interface EmergencyContact {
  id: string;
  name: string;
  type: string; // police | hospital | ambulance | fire_force | blood_bank | custom
  typeLabel: string;
  phone: string;
  alt?: string;
}

export interface HomeCategoryItem {
  id?: string;
  key: string;
  label: string;
  sub?: string;
  icon: string;
  color: string;
  link?: string;
  template?: 'link' | 'directory' | 'places';
}

export interface CategoryEntryItem {
  id: string;
  title: string;
  subtitle?: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  link?: string;
}

// Built-in home tiles, shown until the backend's per-village categories load.
export const DEFAULT_CATEGORIES: HomeCategoryItem[] = [
  { key: 'businesses', label: 'Businesses', sub: 'Shops & more', icon: 'store', color: '#16A34A' },
  { key: 'services', label: 'Services', sub: 'Local services', icon: 'wrench', color: '#3B82F6' },
  { key: 'emergency', label: 'Emergency', sub: 'Quick contacts', icon: 'siren', color: '#EF4444' },
  { key: 'announcements', label: 'Notices', sub: 'Updates & alerts', icon: 'megaphone', color: '#8B5CF6' },
  { key: 'transport', label: 'Taxi', sub: 'Autos & cabs', icon: 'car', color: '#F59E0B' },
  { key: 'bus', label: 'Bus', sub: 'Bus timings', icon: 'bus', color: '#0891B2' },
  { key: 'health', label: 'Health', sub: 'Hospitals & more', icon: 'heart-pulse', color: '#EC4899' },
  { key: 'education', label: 'Education', sub: 'Schools & more', icon: 'graduation-cap', color: '#0EA5E9' },
];
