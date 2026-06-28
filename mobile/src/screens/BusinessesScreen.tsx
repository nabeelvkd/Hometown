import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { DetailHeader } from '../components/DetailHeader';
import { BusinessCard } from '../components/cards';
import { nattileApi } from '../api/nattile';
import { useVillage } from '../store/village';
import { palette } from '../theme';
import type { Business } from '../data/mock';

export function BusinessesScreen({
  initialCategory,
  onBack,
  onOpen,
}: {
  initialCategory?: string;
  onBack: () => void;
  onOpen: (b: Business) => void;
}) {
  const { village } = useVillage();
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [all, setAll] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    nattileApi
      .listBusinesses(village?.id)
      .then(setAll)
      .finally(() => setLoading(false));
  }, [village?.id]);

  // Build the category chips from the data (so custom categories show too).
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    all.forEach((b) => map.set(b.category, b.categoryLabel));
    return [{ key: undefined as string | undefined, label: 'All' }, ...[...map].map(([key, label]) => ({ key, label }))];
  }, [all]);

  const items = category ? all.filter((b) => b.category === category) : all;

  return (
    <View className="flex-1 bg-white">
      <DetailHeader title="Businesses" subtitle={`Shops & stores in ${village?.name ?? ''}`} onBack={onBack} />

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
        keyExtractor={(b) => b.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingTop: 4, gap: 14 }}
        renderItem={({ item }) => <BusinessCard item={item} fullWidth onPress={() => onOpen(item)} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-10" color={palette.primary} />
          ) : (
            <Text className="mt-10 text-center text-[#6B7280]">No businesses found.</Text>
          )
        }
      />
    </View>
  );
}
