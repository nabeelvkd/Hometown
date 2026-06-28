import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCheck, Car, MessageCircle, Phone, Star, Users } from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber, openWhatsApp } from '../lib/helpers';
import { img } from '../lib/img';
import { DetailHeader } from '../components/DetailHeader';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import type { Taxi } from '../data/mock';

export function TaxisScreen({ onBack }: { onBack: () => void }) {
  const { village } = useVillage();
  const [items, setItems] = useState<Taxi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    nattileApi
      .listTaxis(village?.id)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [village?.id]);

  return (
    <View className="flex-1 bg-[#F4F7F5]">
      <DetailHeader title="Taxis & Autos" subtitle={`Drivers in ${village?.name ?? ''}`} onBack={onBack} />
      <FlatList
        data={items}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View
            className="rounded-2xl border border-[#EEF1F5] bg-white p-3"
            style={{ shadowColor: '#0B1F16', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <View className="flex-row items-center">
              {item.photo ? (
                <Image source={{ uri: img(item.photo, 'avatar') }} className="h-16 w-16 rounded-xl bg-[#F1F5F9]" />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-xl bg-[#FEF3E2]">
                  <Car size={26} color="#F59E0B" />
                </View>
              )}
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-[15px] font-bold text-[#111827]">{item.driverName}</Text>
                  {item.verified && <BadgeCheck size={15} color={palette.primary} style={{ marginLeft: 4 }} />}
                </View>
                <View className="mt-0.5 flex-row items-center">
                  <View className="rounded-md bg-[#FEF3E2] px-2 py-0.5">
                    <Text className="text-[11px] font-bold text-[#B7791F]">{item.vehicleTypeLabel}</Text>
                  </View>
                  <Text className="ml-2 text-[13px] font-semibold tracking-wide text-[#374151]">
                    {item.vehicleNumber}
                  </Text>
                </View>
                <View className="mt-1 flex-row items-center">
                  <Star size={12} color={palette.star} fill={palette.star} />
                  <Text className="ml-1 text-[12px] font-bold text-[#111827]">{item.rating.toFixed(1)}</Text>
                  <Text className="ml-1 text-[12px] text-[#9CA3AF]">({item.reviews})</Text>
                  {item.seats ? (
                    <View className="ml-3 flex-row items-center">
                      <Users size={12} color={palette.textMuted} />
                      <Text className="ml-1 text-[12px] text-[#6B7280]">{item.seats} seats</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {item.description ? (
              <Text className="mt-2 text-[13px] text-[#4B5563]">{item.description}</Text>
            ) : null}

            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                onPress={() => callNumber(item.phone)}
                className="flex-1 flex-row items-center justify-center rounded-xl bg-[#16A34A] py-2.5">
                <Phone size={16} color="#fff" />
                <Text className="ml-2 text-[14px] font-bold text-white">Call</Text>
              </TouchableOpacity>
              {item.whatsapp ? (
                <TouchableOpacity
                  onPress={() => openWhatsApp(item.whatsapp!, `Hi ${item.driverName}, I need a ${item.vehicleTypeLabel.toLowerCase()}.`)}
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-[#16A34A] py-2.5">
                  <MessageCircle size={16} color={palette.primary} />
                  <Text className="ml-2 text-[14px] font-bold text-[#15803D]">WhatsApp</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-10" color={palette.primary} />
          ) : (
            <Text className="mt-10 text-center text-[#6B7280]">No taxis listed yet.</Text>
          )
        }
      />
    </View>
  );
}
