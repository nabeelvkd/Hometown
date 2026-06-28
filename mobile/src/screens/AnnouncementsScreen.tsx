import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { palette } from '../theme';
import { DetailHeader } from '../components/DetailHeader';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import { useNotifications } from '../store/notifications';
import type { Announcement } from '../data/mock';

export function AnnouncementsScreen({ onBack }: { onBack: () => void }) {
  const { village } = useVillage();
  const { markAllSeen } = useNotifications();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    nattileApi.listAnnouncements(village?.id).then(setItems);
  }, [village?.id]);

  // Opening this screen clears the unread badge.
  useEffect(() => {
    markAllSeen();
  }, [markAllSeen]);

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <DetailHeader title="Announcements" subtitle={`Local updates · ${village?.name ?? ''}`} onBack={onBack} />
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View
            className="rounded-2xl border border-[#EEF1F5] bg-white p-4"
            style={{ shadowColor: '#0B1F16', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F3E8FF]">
                <Megaphone size={18} color={palette.announce} />
              </View>
              <Text className="ml-2 flex-1 text-[15px] font-bold text-[#111827]">{item.title}</Text>
            </View>
            <Text className="mt-2 text-[14px] leading-[21px] text-[#4B5563]">{item.body}</Text>
            <Text className="mt-2 text-[11px] text-[#9CA3AF]">{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}
