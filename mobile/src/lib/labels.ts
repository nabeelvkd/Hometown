// Human-readable labels for known category / type keys, with a titlecase
// fallback so custom (admin-entered) categories still display nicely.
const KNOWN: Record<string, string> = {
  grocery: 'Grocery',
  bakery: 'Bakery',
  medical_store: 'Medical Store',
  restaurant: 'Restaurant',
  hardware: 'Hardware',
  supermarket: 'Supermarket',
  electrician: 'Electrician',
  plumber: 'Plumber',
  carpenter: 'Carpenter',
  painter: 'Painter',
  ac_technician: 'AC Technician',
  cleaning: 'Cleaning',
  police: 'Police',
  hospital: 'Hospital',
  ambulance: 'Ambulance',
  fire_force: 'Fire Force',
  blood_bank: 'Blood Bank',
};

export function prettyLabel(key?: string): string {
  if (!key) return '';
  if (KNOWN[key]) return KNOWN[key];
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Relative time like "2 hours ago" from an ISO date. */
export function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
