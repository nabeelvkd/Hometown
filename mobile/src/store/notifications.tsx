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
import { nattileApi } from '../api/nattile';
import { useVillage } from './village';

interface NotificationsContextValue {
  /** Number of notices newer than what the user has already seen. */
  unread: number;
  /** Re-check the unread count (e.g. when the Home tab is opened). */
  refresh: () => void;
  /** Mark all current notices as read (call when the user opens them). */
  markAllSeen: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
const keyFor = (villageId: string) => `nattile.notice.seen.${villageId}`;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { village } = useVillage();
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    const id = village?.id;
    if (!id) {
      setUnread(0);
      return;
    }
    try {
      const [list, lastSeen] = await Promise.all([
        nattileApi.listAnnouncements(id),
        AsyncStorage.getItem(keyFor(id)),
      ]);
      // Notices created after the last time the user opened them are unread.
      const count = list.filter((a) => !lastSeen || (a.createdAt ?? '') > lastSeen).length;
      setUnread(count);
    } catch {
      setUnread(0);
    }
  }, [village?.id]);

  const markAllSeen = useCallback(async () => {
    const id = village?.id;
    if (!id) return;
    setUnread(0);
    try {
      await AsyncStorage.setItem(keyFor(id), new Date().toISOString());
    } catch {
      /* ignore */
    }
  }, [village?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ unread, refresh, markAllSeen }), [unread, refresh, markAllSeen]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
