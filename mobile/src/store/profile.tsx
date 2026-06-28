import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  name: string;
  language: 'en' | 'ml';
  /** Local image URI chosen from the device gallery (no account needed). */
  avatar?: string;
}

interface ProfileContextValue {
  profile: Profile;
  update: (patch: Partial<Profile>) => void;
}

const STORAGE_KEY = 'nattile.profile.v1';
const DEFAULT_PROFILE: Profile = { name: 'Guest', language: 'en' };

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  // Restore the saved profile on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
      })
      .catch(() => undefined);
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ profile, update }), [profile, update]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
