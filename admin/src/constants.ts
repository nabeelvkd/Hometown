/** Mirrors the backend constants so dropdowns and labels stay in sync. */

export const BUSINESS_CATEGORIES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'medical_store', label: 'Medical Store' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'supermarket', label: 'Supermarket' },
];

export const SERVICE_CATEGORIES = [
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'painter', label: 'Painter' },
  { value: 'ac_technician', label: 'AC Technician' },
  { value: 'cleaning', label: 'Cleaning Services' },
];

export const VEHICLE_TYPES = [
  { value: 'auto', label: 'Auto' },
  { value: 'car', label: 'Car' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'van', label: 'Van' },
  { value: 'tempo', label: 'Tempo' },
  { value: 'bike', label: 'Bike Taxi' },
];

// Icon names available for home-screen category tiles (must match the mobile
// app's icon registry in src/components/categoryIcons.tsx).
export const CATEGORY_ICONS = [
  'store', 'wrench', 'siren', 'megaphone', 'car', 'bus', 'heart-pulse',
  'graduation-cap', 'briefcase', 'layout-grid', 'map-pin', 'phone',
  'shopping-bag', 'utensils', 'pill', 'building-2', 'calendar', 'sparkles',
  'droplet', 'leaf', 'landmark', 'dumbbell', 'scissors', 'baby',
];

export const BUS_TAGS = [
  { value: 'ksrtc', label: 'KSRTC' },
  { value: 'private', label: 'Private' },
  { value: 'fast', label: 'Fast Passenger' },
  { value: 'ordinary', label: 'Ordinary' },
  { value: 'express', label: 'Express' },
  { value: 'city', label: 'City' },
];

export const BUS_DESTINATIONS = [
  { value: 'Kozhikode', label: 'Kozhikode' },
  { value: 'Kunnamangalam', label: 'Kunnamangalam' },
  { value: 'Medical College', label: 'Medical College' },
  { value: 'REC', label: 'REC' },
];

export const EMERGENCY_TYPES = [
  { value: 'police', label: 'Police Station' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'fire_force', label: 'Fire Force' },
  { value: 'blood_bank', label: 'Blood Bank' },
];

export const ANNOUNCEMENT_TYPES = [
  { value: 'power_shutdown', label: 'Power Shutdown' },
  { value: 'road_closure', label: 'Road Closure' },
  { value: 'health_camp', label: 'Health Camp' },
  { value: 'municipality', label: 'Municipality' },
  { value: 'general', label: 'General' },
];

/** Quick value -> label lookup for rendering table cells. */
export function labelFor(
  options: { value: string; label: string }[],
  value?: string
): string {
  return options.find((o) => o.value === value)?.label ?? value ?? '—';
}
