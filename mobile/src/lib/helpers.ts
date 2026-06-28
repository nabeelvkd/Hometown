import { Linking } from 'react-native';

/** Opens the phone dialer for a number. */
export function callNumber(phone: string): void {
  Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => undefined);
}

/** Opens a WhatsApp chat, optionally pre-filling a message. */
export function openWhatsApp(phone: string, message?: string): void {
  const num = phone.replace(/[^\d]/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  Linking.openURL(`https://wa.me/${num}${text}`).catch(() => undefined);
}

/** Opens the location in Google Maps (falls back to the device's geo app). */
export function openMap(lat: number, lng: number, _label?: string): void {
  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`).catch(() =>
    Linking.openURL(`geo:${lat},${lng}`).catch(() => undefined)
  );
}

/** Opens turn-by-turn directions to the point in Google Maps. */
export function openDirections(lat: number, lng: number): void {
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`).catch(() =>
    Linking.openURL(`geo:${lat},${lng}`).catch(() => undefined)
  );
}

/** Greeting based on local hour. */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** e.g. "Today, 28 May" */
export function todayLabel(d = new Date()): string {
  return `Today, ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
}
