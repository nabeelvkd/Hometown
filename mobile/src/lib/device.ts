import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'nattile.deviceId.v1';
let cached: string | null = null;

function makeId(): string {
  return `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** Stable anonymous id for this install (used to count unique users). */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    let id = await AsyncStorage.getItem(KEY);
    if (!id) {
      id = makeId();
      await AsyncStorage.setItem(KEY, id);
    }
    cached = id;
    return id;
  } catch {
    cached = cached ?? makeId();
    return cached;
  }
}
