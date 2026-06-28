import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BadgeCheck, ChevronRight, Phone, Star } from 'lucide-react-native';
import { palette } from '../theme';
import { callNumber } from '../lib/helpers';
import { img } from '../lib/img';
import { DetailHeader } from '../components/DetailHeader';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import type { ServiceProvider } from '../data/mock';

export function ServicesScreen({
  initialCategory,
  onBack,
  onOpen,
}: {
  initialCategory?: string;
  onBack: () => void;
  onOpen: (p: ServiceProvider) => void;
}) {
  const { village } = useVillage();
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [all, setAll] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    nattileApi
      .listServices(village?.id)
      .then(setAll)
      .finally(() => setLoading(false));
  }, [village?.id]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach((p) => map.set(p.category, p.categoryLabel));
    return [{ key: undefined as string | undefined, label: 'All' }, ...[...map].map(([key, label]) => ({ key, label }))];
  }, [all]);

  const items = category ? all.filter((p) => p.category === category) : all;

  return (
    <View className="flex-1 bg-white">
      <DetailHeader title="Service Providers" subtitle={`Trusted experts in ${village?.name ?? ''}`} onBack={onBack} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' }}
        style={{ flexGrow: 0, flexShrink: 0 }}>
        {categories.map((c) => {
          const active = category === c.key;
          return (
            <TouchableOpacity
              key={c.key ?? 'all'}
              onPress={() => setCategory(c.key)}
              className={`rounded-full border px-4 py-2 ${active ? 'border-[#16A34A] bg-[#16A34A]' : 'border-[#EEF1F5] bg-[#F5F7F9]'}`}>
              <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-[#6B7280]'}`}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onOpen(item)}
            className="flex-row items-center rounded-2xl border border-[#EEF1F5] bg-white p-3"
            style={{ shadowColor: '#0B1F16', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
            <Image source={{ uri: img(item.photo, 'avatar') }} className="h-16 w-16 rounded-xl bg-[#F1F5F9]" />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-[15px] font-bold text-[#111827]">{item.name}</Text>
                {item.verified && <BadgeCheck size={15} color={palette.primary} style={{ marginLeft: 4 }} />}
              </View>
              <Text className="mt-0.5 text-[13px] text-[#6B7280]">
                {item.categoryLabel} · {item.experienceYears} yrs
              </Text>
              <View className="mt-1 flex-row items-center">
                <Star size={12} color={palette.star} fill={palette.star} />
                <Text className="ml-1 text-[12px] font-bold text-[#111827]">{item.rating.toFixed(1)}</Text>
                <Text className="ml-1 text-[12px] text-[#9CA3AF]">({item.reviews})</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => callNumber(item.phone)}
              hitSlop={8}
              className="mr-1 h-10 w-10 items-center justify-center rounded-full bg-[#E7F6EC]">
              <Phone size={18} color={palette.primary} />
            </TouchableOpacity>
            <ChevronRight size={18} color={palette.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-10" color={palette.primary} />
          ) : (
            <Text className="mt-10 text-center text-[#6B7280]">No providers found.</Text>
          )
        }
      />
    </View>
  );
}
