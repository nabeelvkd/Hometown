import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Droplet, Flame, Phone, Pill, Shield, Siren } from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber } from '../lib/helpers';
import { DetailHeader } from '../components/DetailHeader';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import type { EmergencyContact } from '../data/mock';

const ICON: Record<string, typeof Shield> = {
  police: Shield,
  hospital: Pill,
  ambulance: Siren,
  fire_force: Flame,
  blood_bank: Droplet,
};

export function EmergencyScreen({ onBack }: { onBack: () => void }) {
  const { village } = useVillage();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    nattileApi.listEmergency(village?.id).then(setContacts);
  }, [village?.id]);

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <DetailHeader title="Emergency Contacts" subtitle={`Important numbers · ${village?.name ?? ''}`} onBack={onBack} />
      <FlatList
        data={contacts}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-1 rounded-2xl bg-[#FEF2F2] p-3">
            <Text className="text-[13px] text-[#9B3B3B]">
              Tap the call button to dial directly. Save these numbers for quick access.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const Icon = ICON[item.type] ?? Shield;
          return (
            <View
              className="flex-row items-center rounded-2xl border border-[#EEF1F5] bg-white p-3"
              style={{ shadowColor: '#0B1F16', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#FEE2E2]">
                <Icon size={22} color="#EF4444" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] font-bold text-[#111827]">{item.name}</Text>
                <Text className="mt-0.5 text-[13px] text-[#6B7280]">
                  {item.typeLabel}
                  {item.alt ? ` · Alt: ${item.alt}` : ''}
                </Text>
                <Text className="mt-0.5 text-[15px] font-semibold text-[#15803D]">{item.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => callNumber(item.phone)}
                className="h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]">
                <Phone size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}
