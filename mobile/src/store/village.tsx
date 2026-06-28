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

export interface SelectedVillage {
  id: string;
  name: string;
  area: string;
  district: string;
}

interface VillageContextValue {
  village: SelectedVillage | null;
  ready: boolean;
  setVillage: (v: SelectedVillage) => void;
  clear: () => void;
}

const STORAGE_KEY = 'nattile.village.v1';
const VillageContext = createContext<VillageContextValue | undefined>(undefined);

export function VillageProvider({ children }: { children: ReactNode }) {
  const [village, setVillageState] = useState<SelectedVillage | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the previously selected village on launch.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setVillageState(JSON.parse(raw));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setVillage = useCallback((v: SelectedVillage) => {
    setVillageState(v);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(v)).catch(() => undefined);
  }, []);

  const clear = useCallback(() => {
    setVillageState(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ village, ready, setVillage, clear }),
    [village, ready, setVillage, clear]
  );

  return <VillageContext.Provider value={value}>{children}</VillageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVillage(): VillageContextValue {
  const ctx = useContext(VillageContext);
  if (!ctx) throw new Error('useVillage must be used within VillageProvider');
  return ctx;
}
